import { type UseQueryOptions, keepPreviousData, queryOptions } from '@tanstack/react-query';

import { type FindBucketsResponseBody } from '@common/contracts';

import { adminFindBuckets, type AdminFindBucketsPayload } from './adminFindBuckets';
import { BucketApiQueryKeys } from '../../../bucketApiQueryKeys';

export const adminFindBucketsQueryOptions = (
  payload: AdminFindBucketsPayload,
): UseQueryOptions<FindBucketsResponseBody, Error, FindBucketsResponseBody, ['adminFindBuckets']> =>
  queryOptions({
    queryKey: [BucketApiQueryKeys.adminFindBuckets],
    queryFn: () => adminFindBuckets(payload),
    placeholderData: keepPreviousData,
  });
