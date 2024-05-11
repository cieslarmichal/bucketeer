import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { findBuckets } from './findBuckets';

export const findBucketsQueryOptions = (accessToken: string): UseQueryOptions<string[], Error, string[], string[]> =>
  queryOptions({
    queryKey: ['findBuckets'],
    queryFn: () => findBuckets(accessToken),
  });
