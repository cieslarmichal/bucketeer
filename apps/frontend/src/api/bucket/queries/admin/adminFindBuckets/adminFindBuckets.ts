import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../services/httpService/httpService';

export const adminFindBuckets = async (accessToken: string): Promise<Array<string>> => {
  const adminFindBucketsResponse = await HttpService.get<{ data: Array<string> }>({
    url: `admin/api/buckets`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!adminFindBucketsResponse.success) {
    throw new ApiError('ApiError', {
      apiResponseError: adminFindBucketsResponse.body.context,
      message: `Failed to find buckets.`,
      statusCode: adminFindBucketsResponse.statusCode,
    });
  }

  return adminFindBucketsResponse.body.data;
};
