import {
  type FindUserBucketQueryHandler,
  type FindUserBucketQueryHandlerPayload,
  type FindUserBucketQueryHandlerResult,
} from './findUserBucketQueryHandler.js';
import { ResourceNotFoundError } from '../../../../../common/errors/common/resourceNotFoundError.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class FindUserBucketQueryHandlerImpl implements FindUserBucketQueryHandler {
  public constructor(private readonly userRepository: UserRepository) {}

  public async execute(payload: FindUserBucketQueryHandlerPayload): Promise<FindUserBucketQueryHandlerResult> {
    const { userId } = payload;

    const directoryName = await this.userRepository.findUserBuckets({ userId });

    if (!directoryName) {
      throw new ResourceNotFoundError({
        name: 'UserBucket',
        userId,
      });
    }

    return { directoryName };
  }
}
