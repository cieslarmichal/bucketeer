import {
  type FindUserBucketsQueryHandler,
  type FindUserBucketsQueryHandlerPayload,
  type FindUserBucketsQueryHandlerResult,
} from './findUserBucketsQueryHandler.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class FindUserBucketsQueryHandlerImpl implements FindUserBucketsQueryHandler {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(payload: FindUserBucketsQueryHandlerPayload): Promise<FindUserBucketsQueryHandlerResult> {
    const { userId } = payload;

    const userBuckets = await this.userRepository.findUserBuckets({ userId });

    const buckets = userBuckets.map((bucket) => bucket.getBucketName());

    return { buckets };
  }
}
