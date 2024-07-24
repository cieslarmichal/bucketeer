import {
  type FindResourcesQueryParams,
  type FindResourcesPathParams,
  type FindResourcesResponseBody,
} from '@common/contracts';

import { HttpService } from '../../../../../common/services/httpService/httpService';

export interface FindBucketResourcesPayload extends FindResourcesPathParams, FindResourcesQueryParams {
  accessToken: string;
}

export const findBucketResources = async (payload: FindBucketResourcesPayload): Promise<FindResourcesResponseBody> => {
  const { accessToken, bucketName, page, pageSize } = payload;

  const queryParams: Record<string, string> = {};

  if (page) {
    queryParams.page = `${page}`;
  }

  if (pageSize) {
    queryParams.pageSize = `${pageSize}`;
  }

  const response = await HttpService.get<FindResourcesResponseBody>({
    url: `/buckets/${bucketName}/resources`,
    queryParams,
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.success) {
    throw new Error(response.body.message);
  }

  return response.body;
};
