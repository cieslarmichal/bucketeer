import { type UseQueryOptions, useQuery, type UseQueryResult } from '@tanstack/react-query';

import { type FindMyUserResponseBody } from '@common/contracts';

import { findMe } from './findMe';
import { type BaseApiError } from '../../../../../common/services/httpService/types/baseApiError';
import { UserApiQueryKeys } from '../../../userApiQueryKeys';

interface UseFindMeQueryPayload
  extends Partial<Omit<UseQueryOptions<FindMyUserResponseBody, BaseApiError>, 'queryFn'>> {
  accessToken: string;
}

export const useFindMeQuery = (
  options: UseFindMeQueryPayload,
): UseQueryResult<FindMyUserResponseBody, BaseApiError> => {
  const { accessToken } = options;

  return useQuery({
    queryKey: [UserApiQueryKeys.findMe],
    queryFn: () =>
      findMe({
        accessToken,
      }),
    enabled: !!accessToken,
    ...options,
  });
};
