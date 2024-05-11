import { type Resource } from './resource.js';

export interface FindResourcesPathParams {
  readonly bucketName: string;
}

export interface FindResourcesQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindResourcesResponseBody {
  readonly data: Resource[];
  readonly metadata: {
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
  };
}
