import { type FindBucketsResponseBody } from '@common/contracts';

import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../services/httpService/httpService';

export const adminFindBuckets = async (accessToken: string): Promise<FindBucketsResponseBody> => {
  const adminFindBucketsResponse = await HttpService.get<FindBucketsResponseBody>({
    url: `/admin/buckets`,
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

  return adminFindBucketsResponse.body;
};
