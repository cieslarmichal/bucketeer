import {
  type FindUserBucketsQueryHandler,
  type FindUserBucketsQueryHandlerPayload,
  type FindUserBucketsQueryHandlerResult,
} from './findUserDirectoryQueryHandler.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class FindUserBucketQueryHandlerImpl implements FindUserBucketsQueryHandler {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(payload: FindUserBucketsQueryHandlerPayload): Promise<FindUserBucketsQueryHandlerResult> {
    const { userId } = payload;

    const buckets = await this.userRepository.findUserBuckets({ userId });

    return { buckets };
  }
}
