import { type UseQueryOptions, queryOptions } from '@tanstack/react-query';

import { type FindResourcesResponseBody } from '@common/contracts';

import { type FindBucketResourcesPayload, findBucketResources } from './findBucketResources';
import { type BaseApiError } from '../../../../../common/services/httpService/types/baseApiError';

export const findBucketResourcesQueryOptions = (
  payload: FindBucketResourcesPayload,
): UseQueryOptions<FindResourcesResponseBody, BaseApiError, FindResourcesResponseBody, string[]> =>
  queryOptions({
    queryKey: ['findBucketResources', payload.bucketName, `${payload.page}`, `${payload.pageSize}`],
    queryFn: ({ signal }) =>
      findBucketResources({
        ...payload,
        signal,
      }),
    enabled: payload.bucketName !== '',
  });
