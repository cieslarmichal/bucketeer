import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';

import { type RevokeBucketAccessBody, type RevokeBucketAccessPathParams } from '@common/contracts';

import { HttpService } from '../../../../../services/httpService/httpService';
import { type BaseApiError } from '../../../../../services/httpService/types/baseApiError';

interface Payload extends RevokeBucketAccessBody, RevokeBucketAccessPathParams {
  accessToken: string;
}

export const useRevokeUserBucketAccessMutation = (
  options: UseMutationOptions<null, BaseApiError, Payload>,
): UseMutationResult<null, BaseApiError, Payload> => {
  const revokeAccess = async (payload: Payload): Promise<null> => {
    const response = await HttpService.post<null>({
      url: `/admin/users/${payload.id}/revoke-bucket-access`,
      body: {
        bucketName: payload.bucketName,
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
    mutationFn: revokeAccess,
    ...options,
  });
};
