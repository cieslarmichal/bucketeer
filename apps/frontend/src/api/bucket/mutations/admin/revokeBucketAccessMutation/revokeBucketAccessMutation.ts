import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';

import { type RevokeBucketAccessBody, type RevokeBucketAccessPathParams } from '@common/contracts';

import { HttpService } from '../../../../../services/httpService/httpService';
import { type BaseApiError } from '../../../../../services/httpService/types/baseApiError';

export type RevokeBucketAccessMutationPayload = RevokeBucketAccessBody &
  RevokeBucketAccessPathParams & {
    accessToken: string;
  };

export const useRevokeBucketAccessMutation = (
  options: UseMutationOptions<null, BaseApiError, RevokeBucketAccessMutationPayload>,
): UseMutationResult<null, BaseApiError, RevokeBucketAccessMutationPayload, unknown> => {
  const revokeBucketAccess = async (payload: RevokeBucketAccessMutationPayload): Promise<null> => {
    const response = await HttpService.post<null>({
      url: `/admin/api/users/${payload.id}/revoke-bucket-access`,
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
    mutationFn: revokeBucketAccess,
    ...options,
  });
};
