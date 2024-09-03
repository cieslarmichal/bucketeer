import { ExportResourcesBody, ExportResourcesPathParams } from '@common/contracts';
import { UseMutationOptions } from '@tanstack/react-query';
import { BaseApiError } from '../../../../common/services/httpService/types/baseApiError';
import { HttpService } from '../../../../common/services/httpService/httpService';
import { useErrorHandledMutation } from '../../../../common/hooks/useErrorHandledMutation';
import { ErrorCodeMessageMapper } from '../../../../common/mapper/errorCodeMessageMapper';
import { ApiError } from '../../../../common/errors/apiError';

interface DownloadResourcesPayload extends ExportResourcesBody, ExportResourcesPathParams {
  accessToken: string;
}

type DownloadResourcesResponseBody = Blob;

export const useDownloadResourcesMutation = (
  opts: UseMutationOptions<DownloadResourcesResponseBody, BaseApiError, DownloadResourcesPayload>,
) => {
  const mapper = new ErrorCodeMessageMapper({});
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
      throw new ApiError("DownloadException", {
        apiResponseError: response.body.context,
        message: mapper.map(response.statusCode),
        statusCode: response.statusCode
      })
    }

    return response.body;
  };

  return useErrorHandledMutation({
    mutationFn: download,
    ...opts,
  });
};
