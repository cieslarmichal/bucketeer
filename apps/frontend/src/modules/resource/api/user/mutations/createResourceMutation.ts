import { useMutation, type UseMutationResult, type UseMutationOptions } from '@tanstack/react-query';

import { type UploadResourcesPathParams } from '@common/contracts';

import { HttpService } from '../../../../common/services/httpService/httpService';
import { type BaseApiError } from '../../../../common/services/httpService/types/baseApiError';

export interface CreateResourcesPayload extends UploadResourcesPathParams {
  accessToken: string;
  files: File[];
  signal?: AbortSignal;
}

export const useCreateResourcesMutation = (
  options: UseMutationOptions<void, BaseApiError, CreateResourcesPayload>,
): UseMutationResult<void, BaseApiError, CreateResourcesPayload> => {
  const createResources = async (payload: CreateResourcesPayload): Promise<void> => {
    const response = await HttpService.post<void>({
      url: `/buckets/${payload.bucketName}/resources`,
      // todo: add better types
      //   eslint-disable-next-line
      body: payload.files as any,
      headers: {
        Authorization: `Bearer ${payload.accessToken}`,
      },
      type: 'octet-stream',
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

  return useMutation({
    mutationFn: createResources,
    ...options,
  });
};
