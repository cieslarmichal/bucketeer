import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindUsersResponseBody } from '@common/contracts';

import { type AdminFindUsersPayload, adminFindUsers } from './findUsers';
import { UserApiQueryKeys } from '../../../userApiQueryKeys';

export const adminFindUsersQueryOptions = (
  payload: AdminFindUsersPayload,
): UseQueryOptions<FindUsersResponseBody, Error, FindUsersResponseBody, ['findUsers']> =>
  queryOptions({
    queryKey: [UserApiQueryKeys.findUsers],
    queryFn: () => adminFindUsers(payload),
  });
