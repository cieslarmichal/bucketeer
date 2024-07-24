import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindBucketsResponseBody } from '@common/contracts';

import { type FindBucketsPayload, findBuckets } from './findBuckets';
import { BucketApiQueryKeys } from '../../../bucketApiQueryKeys';

export const findBucketsQueryOptions = (
  payload: FindBucketsPayload,
): UseQueryOptions<FindBucketsResponseBody, Error, FindBucketsResponseBody, string[]> =>
  queryOptions({
    queryKey: [BucketApiQueryKeys.findBuckets, payload.userId],
    queryFn: () => findBuckets(payload),
  });
