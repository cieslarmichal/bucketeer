import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindUsersWithBucketsResponseBody } from '@common/contracts';

import { type AdminFindUsersPayload, adminFindUsers } from './findUsers';
import { UserApiQueryKeys } from '../../../userApiQueryKeys';

export const adminFindUsersQueryOptions = (
  payload: AdminFindUsersPayload,
): UseQueryOptions<FindUsersWithBucketsResponseBody, Error, FindUsersWithBucketsResponseBody, ['findUsers']> =>
  queryOptions({
    queryKey: [UserApiQueryKeys.findUsers],
    queryFn: () => adminFindUsers(payload),
  });
