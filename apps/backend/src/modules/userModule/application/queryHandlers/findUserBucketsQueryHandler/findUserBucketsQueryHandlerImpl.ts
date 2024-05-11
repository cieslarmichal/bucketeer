import {
  type FindUserBucketsQueryHandler,
  type FindUserBucketsQueryHandlerPayload,
  type FindUserBucketsQueryHandlerResult,
} from './findUserBucketsQueryHandler.js';
import { type UserBucketRepository } from '../../../domain/repositories/userBucketRepository/userBucketRepository.js';

export class FindUserBucketsQueryHandlerImpl implements FindUserBucketsQueryHandler {
  public constructor(private readonly userBucketRepository: UserBucketRepository) {}

  public async execute(payload: FindUserBucketsQueryHandlerPayload): Promise<FindUserBucketsQueryHandlerResult> {
    const { userId } = payload;

    const userBuckets = await this.userBucketRepository.findUserBuckets({ userId });

    const buckets = userBuckets.map((bucket) => ({
      name: bucket.getBucketName(),
    }));

    return { buckets };
  }
}
