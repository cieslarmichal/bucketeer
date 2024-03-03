import { QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type Router, createRouter } from '@tanstack/react-router';
import { useState } from 'react';
import { useStore } from 'zustand';

import { type RefreshUserTokensResponseBody } from '@common/contracts';

import { UserApiError } from '../../api/user/errors/userApiError';
import { ApiError } from '../../common/errors/apiError';
import { routeTree } from '../../routeTree.gen';
import { HttpService } from '../../services/httpService/httpService';
import { userTokensStore } from '../stores/userTokens/userTokens';

export function createAppRouter(): Router {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 1000 * 30,
        retry: (failureCount, error): boolean => {
          if (error instanceof ApiError && error.context.statusCode === 401) {
            return false;
          }

          return failureCount < 3;
        },
      },
    },
    queryCache: new QueryCache(),
  });

  return createRouter({
    routeTree,
    context: {
      queryClient,
      authenticated: false,
      role: '',
    },
    Wrap: ({ children }) => {
      const [refreshingToken, setRefreshingToken] = useState<boolean>(false);

      const store = useStore(userTokensStore);

      const refreshToken = store.accessToken;

      const refreshTokens = async (): Promise<RefreshUserTokensResponseBody | void> => {
        if (refreshingToken) {
          return;
        }

        const refreshUserTokensResponse = await HttpService.post<RefreshUserTokensResponseBody>({
          url: '/users/token',
          body: {
            refreshToken,
          },
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (refreshUserTokensResponse.success === false) {
          throw new UserApiError({
            message: 'Failed to refresh user tokens.',
            apiResponseError: refreshUserTokensResponse.body.context,
            statusCode: refreshUserTokensResponse.statusCode,
          });
        }

        return refreshUserTokensResponse.body;
      };

      queryClient.getQueryCache().config.onError = async (error): Promise<void> => {
        if (error instanceof ApiError && error.context.statusCode === 401) {
          try {
            setRefreshingToken(true);

            const res = await refreshTokens();

            if (res) {
              store.setTokens(res);
            }
          } catch (error) {
            store.removeTokens();
          } finally {
            setRefreshingToken(false);
          }
        }
      };

      return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
    },
  });
}
