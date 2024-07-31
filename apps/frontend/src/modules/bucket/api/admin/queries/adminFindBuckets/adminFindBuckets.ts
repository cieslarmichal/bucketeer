import { type FindBucketsResponseBody } from '@common/contracts';

import { ApiError } from '../../../../../common/errors/apiError';
import { HttpService } from '../../../../../common/services/httpService/httpService';

export interface AdminFindBucketsPayload {
  page?: number;
  pageSize?: number;
  accessToken: string;
}

export const adminFindBuckets = async (payload: AdminFindBucketsPayload): Promise<FindBucketsResponseBody> => {
  const { accessToken, page, pageSize } = payload;

  const adminFindBucketsResponse = await HttpService.get<FindBucketsResponseBody>({
    url: `/admin/buckets`,
    queryParams: {
      page: `${(page ?? 0) + 1}`,
      pageSize: `${pageSize || 10}`,
    },
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
