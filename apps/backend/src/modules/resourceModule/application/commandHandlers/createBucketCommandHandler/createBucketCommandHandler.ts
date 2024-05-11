import { type CommandHandler } from '../../../../../common/types/commandHandler.js';
import { type S3Bucket } from '../../../../../libs/s3/types/s3Bucket.js';

export interface CreateBucketCommandHandlerPayload {
  readonly bucketName: string;
}

export interface CreateBucketCommandHandlerResult {
  readonly bucket: S3Bucket;
}

export type CreateBucketCommandHandler = CommandHandler<
  CreateBucketCommandHandlerPayload,
  CreateBucketCommandHandlerResult
>;
