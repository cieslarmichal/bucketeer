import { ApiError } from '../../../../common/errors/apiError';
import { HttpService } from '../../../../services/httpService/httpService';

export const findBuckets = async (accessToken: string): Promise<Array<string>> => {
  const findBucketsResponse = await HttpService.get<{ data: Array<string> }>({
    url: 'api/buckets',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (findBucketsResponse.success === false) {
    throw new ApiError('ApiError', {
      apiResponseError: findBucketsResponse.body.context,
      message: 'Failed to find buckets.',
      statusCode: findBucketsResponse.statusCode,
    });
  }

  return findBucketsResponse.body.data;
};
