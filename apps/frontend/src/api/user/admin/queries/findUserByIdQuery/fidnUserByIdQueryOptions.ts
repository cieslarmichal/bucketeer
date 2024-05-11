import { type UseQueryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type FindUserResponseBody } from '@common/contracts';

import { findUserById } from './findUserById';
import { type BaseApiError } from '../../../../../services/httpService/types/baseApiError';

interface UseFindUserByIdQuery extends Omit<Partial<UseQueryOptions<FindUserResponseBody, BaseApiError>>, 'queryFn'> {
  accessToken: string;
  id: string;
}

export const useFindUserByIdQuery = (
  options: UseFindUserByIdQuery,
): UseQueryResult<FindUserResponseBody, BaseApiError> => {
  const { accessToken, id } = options;

  return useQuery({
    queryKey: ['findUserById', id],
    queryFn: () =>
      findUserById({
        accessToken,
        id,
      }),
    ...options,
  });
};
