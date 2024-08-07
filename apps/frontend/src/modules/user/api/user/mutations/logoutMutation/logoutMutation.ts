import { type UseMutationOptions, useMutation, type UseMutationResult } from '@tanstack/react-query';

import { type LogoutUserBody, type LogoutUserPathParams } from '@common/contracts';

import { HttpService } from '../../../../../common/services/httpService/httpService';
import { UserApiError } from '../../../errors/userApiError';

type LogoutUserPayload = LogoutUserBody &
  LogoutUserPathParams & {
    accessToken: string;
  };

export const useLogoutUserMutation = (
  options: UseMutationOptions<void, UserApiError, LogoutUserPayload>,
): UseMutationResult<void, UserApiError, LogoutUserPayload, unknown> => {
  const logoutUser = async (values: LogoutUserPayload): Promise<void> => {
    const { id, refreshToken, accessToken } = values;

    const logoutUserResponse = await HttpService.post<void>({
      url: `/users/${id}/logout`,
      body: {
        refreshToken,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (logoutUserResponse.success === false) {
      throw new UserApiError({
        message: mapStatusCodeToErrorMessage(logoutUserResponse.statusCode),
        apiResponseError: logoutUserResponse.body.context,
        statusCode: logoutUserResponse.statusCode,
      });
    }

    return;
  };

  return useMutation({
    mutationFn: logoutUser,
    ...options,
  });
};

const mapStatusCodeToErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'Invalid refresh token.';

    case 401:
      return 'Invalid refresh token.';

    case 500:
      return 'Internal server error';

    default:
      return 'Unknown error';
  }
};
