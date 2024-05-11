import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';

import { type DeleteBucketPathParams } from '@common/contracts';

import { HttpService } from '../../../../../services/httpService/httpService';
import { type BaseApiError } from '../../../../../services/httpService/types/baseApiError';

export type DeleteBucketMutationPayload = DeleteBucketPathParams & {
  accessToken: string;
};

export const useDeleteBucketMutation = (
  options: UseMutationOptions<null, BaseApiError, DeleteBucketMutationPayload, unknown>,
): UseMutationResult<null, BaseApiError, DeleteBucketMutationPayload, unknown> => {
  const deleteBucket = async (payload: DeleteBucketMutationPayload): Promise<null> => {
    const response = await HttpService.delete<null>({
      url: `/admin/buckets/${payload.bucketName}`,
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
    mutationFn: deleteBucket,
    ...options,
  });
};
