import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindBucketsResponseBody } from '@common/contracts';

import { adminFindBuckets } from './adminFindBuckets';

export const adminFindBucketsQueryOptions = (
  accessToken: string,
): UseQueryOptions<FindBucketsResponseBody, Error, FindBucketsResponseBody, string[]> =>
  queryOptions({
    queryKey: ['findBuckets'],
    queryFn: () => adminFindBuckets(accessToken),
  });
