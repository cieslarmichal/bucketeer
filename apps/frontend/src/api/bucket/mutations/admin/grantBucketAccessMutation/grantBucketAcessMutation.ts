import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';

import { type GrantBucketAccessPathParams, type GrantBucketAccessBody } from '@common/contracts';

import { HttpService } from '../../../../../services/httpService/httpService';
import { type BaseApiError } from '../../../../../services/httpService/types/baseApiError';

export type GrantBucketAccessMutationPayload = GrantBucketAccessBody &
  GrantBucketAccessPathParams & {
    accessToken: string;
  };

export const useGrantBucketAccessMutation = (
  options: UseMutationOptions<null, BaseApiError, GrantBucketAccessMutationPayload>,
): UseMutationResult<null, BaseApiError, GrantBucketAccessMutationPayload, unknown> => {
  const grantBucketAccess = async (payload: GrantBucketAccessMutationPayload): Promise<null> => {
    const response = await HttpService.post<null>({
      url: `/admin/api/users/${payload.id}/grant-bucket-access`,
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
    mutationFn: grantBucketAccess,
    ...options,
  });
};
