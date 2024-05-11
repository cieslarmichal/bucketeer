import { type Bucket } from './bucket.js';

export interface CreateBucketBody {
  readonly bucketName: string;
}

export interface CreateBucketResponseBody extends Bucket {}
