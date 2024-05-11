import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type S3Bucket } from '../../../../../libs/s3/types/s3Bucket.js';

export interface FindBucketsQueryHandlerPayload {
  readonly page: number;
  readonly pageSize: number;
}

export interface FindBucketsQueryHandlerResult {
  readonly buckets: S3Bucket[];
  readonly totalPages: number;
}

export type FindBucketsQueryHandler = QueryHandler<FindBucketsQueryHandlerPayload, FindBucketsQueryHandlerResult>;
