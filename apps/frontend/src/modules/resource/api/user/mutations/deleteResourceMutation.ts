import { type UseMutationOptions } from '@tanstack/react-query';

import { DeleteResourcePathParams } from '@common/contracts';

import { HttpService } from '../../../../common/services/httpService/httpService';
import { type BaseApiError } from '../../../../common/services/httpService/types/baseApiError';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';

export interface DeleteResourcePayload extends DeleteResourcePathParams {
  accessToken: string;
  signal?: AbortSignal;
}

export const useDeleteResourceMutation = (
  options: UseMutationOptions<void, BaseApiError, DeleteResourcePayload>,
) => {
  const createResources = async (payload: DeleteResourcePayload): Promise<void> => {
    const response = await HttpService.delete<void>({
      url: `/buckets/${payload.bucketName}/resources/${payload.resourceId}`,
      headers: {
        Authorization: `Bearer ${payload.accessToken}`,
      },
      signal: payload.signal,
    });

    if (!response.success) {
      if (response.body.context && 'reason' in response.body.context) {
        throw new Error((response.body.context?.reason as string) ?? 'Unknown error');
      }

      throw new Error(response.body.message);
    }

    return;
  };

  return useErrorHandledMutation({
    mutationFn: createResources,
    ...options,
  });
};
