import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindUsersResponseBody } from '@common/contracts';

import { type AdminFindUsersPayload, adminFindUsers } from './findUsers';

export const adminFindUsersQueryOptions = (
  payload: AdminFindUsersPayload,
): UseQueryOptions<FindUsersResponseBody, Error, FindUsersResponseBody, string[]> =>
  queryOptions({
    queryKey: ['findUsers'],
    queryFn: () => adminFindUsers(payload),
  });
