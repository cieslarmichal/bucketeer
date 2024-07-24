import { type FindBucketsResponseBody } from '@common/contracts';

import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../common/services/httpService/httpService';

export interface FindBucketsPayload {
  userId: string;
  accessToken: string;
}

export const findBuckets = async (payload: FindBucketsPayload): Promise<FindBucketsResponseBody> => {
  const { accessToken, userId } = payload;

  const findBucketsResponse = await HttpService.get<FindBucketsResponseBody>({
    url: '/buckets',
    queryParams: {
      userId,
    },
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

  return findBucketsResponse.body;
};
