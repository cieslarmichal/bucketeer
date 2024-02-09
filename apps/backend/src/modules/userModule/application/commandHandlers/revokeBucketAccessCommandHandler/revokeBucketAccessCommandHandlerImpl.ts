import {
  type RevokeBucketAccessCommandHandler,
  type RevokeBucketAccessCommandHandlerPayload,
} from './revokeBucketAccessCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserRepository } from '../../../domain/repositories/userRepository/userRepository.js';

export class RevokeBucketAccessCommandHandlerImpl implements RevokeBucketAccessCommandHandler {
  public constructor(
    private readonly userRepository: UserRepository,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: RevokeBucketAccessCommandHandlerPayload): Promise<void> {
    const { userId, bucketName } = payload;

    this.loggerService.debug({
      message: 'Revoking bucket access..',
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

    const existingBuckets = await this.userRepository.findUserBuckets({ userId });

    if (!existingBuckets.find((userBucket) => userBucket.getBucketName() === bucketName)) {
      this.loggerService.debug({
        message: 'User does not have access to the bucket.',
        userId,
        bucketName,
      });

      return;
    }

    existingUser.addRevokeBucketAccessAction({
      bucketName,
    });

    await this.userRepository.updateUser({
      id: userId,
      domainActions: existingUser.getDomainActions(),
    });

    this.loggerService.debug({
      message: 'Bucket access revoked.',
      userId,
      bucketName,
    });
  }
}
