import { type UseMutationOptions } from '@tanstack/react-query';

import { UpdateResourceBody, UpdateResourcePathParams } from '@common/contracts';

import { HttpService } from '../../../../common/services/httpService/httpService';
import { type BaseApiError } from '../../../../common/services/httpService/types/baseApiError';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';

export interface RenameResourcePayload extends UpdateResourcePathParams, UpdateResourceBody {
  accessToken: string;
  signal?: AbortSignal;
}

export const useRenameResourceMutation = (options: UseMutationOptions<void, BaseApiError, RenameResourcePayload>) => {
  const createResources = async (payload: RenameResourcePayload): Promise<void> => {
    const response = await HttpService.post<void>({
      url: `/buckets/${payload.bucketName}/resource/${payload.resourceId}/rename`,
      body: {
        resourceName: payload.resourceName,
      },
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
