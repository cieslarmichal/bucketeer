import { type Bucket } from './bucket.js';

export interface FindUserBucketsQueryParams {
  readonly userId: string;
}

export interface FindUserBucketsResponseBody {
  readonly data: Bucket[];
}
