import { type UseMutationOptions, useMutation, type UseMutationResult } from '@tanstack/react-query';

import { type CreateUserBody, type CreateUserResponseBody } from '@common/contracts';

import { HttpService } from '../../../../../common/services/httpService/httpService';
import { type BaseApiError } from '../../../../../common/services/httpService/types/baseApiError';

type CreateUserPayload = CreateUserBody & {
  accessToken: string;
};

export const useCreateUserMutation = (
  options: UseMutationOptions<CreateUserResponseBody, BaseApiError, CreateUserPayload>,
): UseMutationResult<CreateUserResponseBody, BaseApiError, CreateUserPayload> => {
  const createUser = async (payload: CreateUserPayload): Promise<CreateUserResponseBody> => {
    const response = await HttpService.post<CreateUserResponseBody>({
      url: '/admin/users',
      body: {
        email: payload.email,
        password: payload.password,
      },
      headers: {
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.success) {
      throw new Error(response.body.message);
    }

    return response.body;
  };

  return useMutation({
    mutationFn: createUser,
    ...options,
  });
};
