import { type Bucket } from './bucket.js';

export interface FindBucketsQueryParams {
  readonly page?: number;
  readonly pageSize?: number;
}

export interface FindBucketsResponseBody {
  readonly data: Bucket[];
  readonly metadata: {
    readonly page: number;
    readonly pageSize: number;
    readonly totalPages: number;
  };
}
