import { useMutation, type UseMutationOptions, type UseMutationResult } from '@tanstack/react-query';

import { type GrantBucketAccessPathParams } from '@common/contracts';

import { HttpService } from '../../../../../services/httpService/httpService';
import { type BaseApiError } from '../../../../../services/httpService/types/baseApiError';

export type GrantUserBucketAccessPayload = GrantBucketAccessPathParams & {
  bucketName: string;
  accessToken: string;
};

export const useGrantBucketAccessMutation = (
  options: UseMutationOptions<null, BaseApiError, GrantUserBucketAccessPayload>,
): UseMutationResult<null, BaseApiError, GrantUserBucketAccessPayload, unknown> => {
  const grantBucketAccess = async (payload: GrantUserBucketAccessPayload): Promise<null> => {
    const response = await HttpService.post<null>({
      url: `/admin/users/${payload.id}/grant-bucket-access`,
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
