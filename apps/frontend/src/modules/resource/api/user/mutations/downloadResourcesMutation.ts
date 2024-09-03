import { ExportResourcesBody, ExportResourcesPathParams } from '@common/contracts';
import { useMutation, UseMutationOptions } from '@tanstack/react-query';
import { BaseApiError } from '../../../../common/services/httpService/types/baseApiError';
import { HttpService } from '../../../../common/services/httpService/httpService';

interface DownloadResourcesPayload extends ExportResourcesBody, ExportResourcesPathParams {
  accessToken: string;
}

type DownloadResourcesResponseBody = Blob;

export const useDownloadResourcesMutation = (
  opts: UseMutationOptions<DownloadResourcesResponseBody, BaseApiError, DownloadResourcesPayload>,
) => {
  const download = async (payload: DownloadResourcesPayload) => {
    const response = await HttpService.post<DownloadResourcesResponseBody>({
      url: `/buckets/${payload.bucketName}/resources/export`,
      body: {
        ids: payload.ids,
      },
      headers: {
        Authorization: `Bearer ${payload.accessToken}`,
        Accept: 'application/octet-stream',
      },
    });

    if (!response.success) {
      throw new Error(response.body.message);
    }

    return response.body;
  };

  return useMutation({
    mutationFn: download,
    ...opts,
  });
};
