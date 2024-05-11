import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type S3Bucket } from '../../../../../libs/s3/types/s3Bucket.js';

export interface FindBucketsQueryHandlerResult {
  readonly buckets: S3Bucket[];
}

export type FindBucketsQueryHandler = QueryHandler<void, FindBucketsQueryHandlerResult>;
