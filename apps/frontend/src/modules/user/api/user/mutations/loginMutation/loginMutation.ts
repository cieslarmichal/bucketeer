import { type UseMutationOptions, useMutation, type UseMutationResult } from '@tanstack/react-query';

import { type LoginUserResponseBody } from '@common/contracts';

import { HttpService } from '../../../../../common/services/httpService/httpService';
import { UserApiError } from '../../../errors/userApiError';

export const useLoginUserMutation = (
  options: UseMutationOptions<LoginUserResponseBody, UserApiError, { email: string; password: string }>,
): UseMutationResult<
  LoginUserResponseBody,
  UserApiError,
  {
    email: string;
    password: string;
  },
  unknown
> => {
  const loginUser = async (values: { email: string; password: string }): Promise<LoginUserResponseBody> => {
    const loginUserResponse = await HttpService.post<LoginUserResponseBody>({
      url: '/users/login',
      body: {
        email: values.email,
        password: values.password,
      },
    });

    if (loginUserResponse.success === false) {
      throw new UserApiError({
        message: mapStatusCodeToErrorMessage(loginUserResponse.statusCode),
        apiResponseError: loginUserResponse.body.context,
        statusCode: loginUserResponse.statusCode,
      });
    }

    return loginUserResponse.body;
  };

  return useMutation({
    mutationFn: loginUser,
    ...options,
  });
};

const mapStatusCodeToErrorMessage = (statusCode: number): string => {
  switch (statusCode) {
    case 400:
      return 'Email or password are invalid.';

    case 401:
      return 'Email or password are invalid.';

    case 404:
      return 'Email or password are invalid.';

    case 500:
      return 'Internal server error';

    default:
      return 'Unknown error';
  }
};
