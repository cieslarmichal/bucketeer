import {
  type GrantBucketAccessCommandHandler,
  type GrantBucketAccessCommandHandlerPayload,
} from './grantBucketAccessCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBucketRepository } from '../../../domain/repositories/userBucketRepository/userBucketRepository.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class GrantBucketAccessCommandHandlerImpl implements GrantBucketAccessCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly userBucketRepository: UserBucketRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: GrantBucketAccessCommandHandlerPayload): Promise<void> {
    const { userId, bucketName } = payload;

    this.loggerService.debug({
      message: 'Granting bucket access..',
      userId,
      bucketName,
    });

    const existingUser = await this.userRepository.findUser({ id: userId });

    if (!existingUser) {
      throw new OperationNotValidError({
        reason: 'User not found.',
        userId,
      });
    }

    const existingBuckets = await this.userBucketRepository.findUserBuckets({ userId });

    if (existingBuckets.find((userBucket) => userBucket.getBucketName() === bucketName)) {
      this.loggerService.debug({
        message: 'Bucket access already granted.',
        userId,
        bucketName,
      });

      return;
    }

    await this.userBucketRepository.createUserBucket({
      bucketName,
      userId,
    });

    this.loggerService.debug({
      message: 'Bucket access granted.',
      userId,
      bucketName,
    });
  }
}
