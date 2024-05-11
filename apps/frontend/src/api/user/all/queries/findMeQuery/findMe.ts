import { type UseQueryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type FindMyUserResponseBody } from '@common/contracts';

import { findMe } from './findMeQueryOptions';
import { type BaseApiError } from '../../../../../services/httpService/types/baseApiError';

interface UseFindMeQueryPayload
  extends Partial<Omit<UseQueryOptions<FindMyUserResponseBody, BaseApiError>, 'queryFn'>> {
  accessToken: string;
}

export const useFindMeQuery = (
  options: UseFindMeQueryPayload,
): UseQueryResult<FindMyUserResponseBody, BaseApiError> => {
  const { accessToken } = options;

  return useQuery({
    queryKey: ['findMe'],
    queryFn: () =>
      findMe({
        accessToken,
      }),
    enabled: !!accessToken,
    ...options,
  });
};
