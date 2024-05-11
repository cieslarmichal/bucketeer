import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { adminFindBuckets } from './adminFindBuckets';

export const adminFindBucketsQueryOptions = (
  accessToken: string,
): UseQueryOptions<string[], Error, string[], string[]> =>
  queryOptions({
    queryKey: ['findBuckets'],
    queryFn: () => adminFindBuckets(accessToken),
  });
