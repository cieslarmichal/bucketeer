import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type S3Bucket } from '../../../../../libs/s3/types/s3Bucket.js';

export interface FindUserBucketsQueryHandlerPayload {
  readonly userId: string;
}

export interface FindUserBucketsQueryHandlerResult {
  readonly buckets: S3Bucket[];
}

export type FindUserBucketsQueryHandler = QueryHandler<
  FindUserBucketsQueryHandlerPayload,
  FindUserBucketsQueryHandlerResult
>;
