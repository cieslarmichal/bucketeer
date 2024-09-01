import { ListBucketsCommand } from '@aws-sdk/client-s3';

import {
  type FindUserBucketsQueryHandler,
  type FindUserBucketsQueryHandlerPayload,
  type FindUserBucketsQueryHandlerResult,
} from './findUserBucketsQueryHandler.js';
import { type S3Client } from '../../../../../libs/s3/clients/s3Client/s3Client.js';
import { type UserBucketRepository } from '../../../domain/repositories/userBucketRepository/userBucketRepository.js';

export class FindUserBucketsQueryHandlerImpl implements FindUserBucketsQueryHandler {
  public constructor(
    private readonly userBucketRepository: UserBucketRepository,
    private readonly s3Client: S3Client,
  ) {}

  public async execute(payload: FindUserBucketsQueryHandlerPayload): Promise<FindUserBucketsQueryHandlerResult> {
    const { userId } = payload;

    const existingBuckets = await this.s3Client.send(new ListBucketsCommand({}));

    const userBuckets = await this.userBucketRepository.findUserBuckets({ userId });

    const buckets = userBuckets
      .map((bucket) => ({
        name: bucket.getBucketName(),
      }))
      .filter((bucket) => existingBuckets.Buckets?.some((b) => b.Name === bucket.name));

    return { buckets };
  }
}
