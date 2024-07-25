import { type UseMutationResult, useMutation, type UseMutationOptions } from '@tanstack/react-query';

import { type CreateBucketBody } from '@common/contracts';

import { HttpService } from '../../../../../common/services/httpService/httpService';
import { type BaseApiError } from '../../../../../common/services/httpService/types/baseApiError';

export interface CreateBucketMutationPayload extends CreateBucketBody {
  accessToken: string;
}

export const useCreateBucketMutation = (
  options: UseMutationOptions<null, BaseApiError, CreateBucketMutationPayload>,
): UseMutationResult<null, BaseApiError, CreateBucketMutationPayload, unknown> => {
  const createBook = async (payload: CreateBucketMutationPayload): Promise<null> => {
    const response = await HttpService.post<null>({
      url: '/admin/buckets',
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
    mutationFn: createBook,
    ...options,
  });
};
