import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindBucketsResponseBody } from '@common/contracts';

import { adminFindBuckets } from './adminFindBuckets';
import { BucketApiQueryKeys } from '../../../bucketApiQueryKeys';

export const adminFindBucketsQueryOptions = (
  accessToken: string,
): UseQueryOptions<FindBucketsResponseBody, Error, FindBucketsResponseBody, ['adminFindBuckets']> =>
  queryOptions({
    queryKey: [BucketApiQueryKeys.adminFindBuckets],
    queryFn: () => adminFindBuckets(accessToken),
  });
