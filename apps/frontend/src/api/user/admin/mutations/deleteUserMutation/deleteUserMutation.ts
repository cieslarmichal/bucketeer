import { type UseMutationOptions, useMutation, type UseMutationResult } from '@tanstack/react-query';

import { type DeleteUserPathParams } from '@common/contracts';

import { HttpService } from '../../../../../services/httpService/httpService';
import { type BaseApiError } from '../../../../../services/httpService/types/baseApiError';

type DeleteUserPayload = DeleteUserPathParams & {
  accessToken: string;
};

export const useDeleteUserMutation = (
  options: UseMutationOptions<null, BaseApiError, DeleteUserPayload>,
): UseMutationResult<null, BaseApiError, DeleteUserPayload> => {
  const deleteUser = async (payload: DeleteUserPayload): Promise<null> => {
    const response = await HttpService.delete<null>({
      url: `/admin/users/${payload.id}`,
      headers: {
        Authorization: `Bearer ${payload.accessToken}`,
      },
    });

    if (!response.success) {
      throw new Error(response.body.message);
    }

    return null;
  };

  return useMutation({
    mutationFn: deleteUser,
    ...options,
  });
};
