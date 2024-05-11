import {
  type DeleteResourceCommandHandler,
  type DeleteResourceCommandHandlerPayload,
} from './deleteResourceCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class DeleteResourceCommandHandlerImpl implements DeleteResourceCommandHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
  ) {}

  public async execute(payload: DeleteResourceCommandHandlerPayload): Promise<void> {
    const { userId, resourceId, bucketName } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.some((bucket) => bucket.name === bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket does not exist.',
        userId,
        bucketName,
      });
    }

    this.loggerService.debug({
      message: 'Deleting Resource...',
      userId,
      bucketName,
      resourceId,
    });

    const existingResource = await this.resourceBlobSerice.resourceExists({
      bucketName,
      resourceId,
    });

    if (!existingResource) {
      throw new OperationNotValidError({
        reason: 'Cannot delete resource because it does not exist.',
        resourceId,
        bucketName,
      });
    }

    await this.resourceBlobSerice.deleteResource({
      bucketName,
      resourceId,
    });

    this.loggerService.debug({
      message: 'Resource deleted.',
      userId,
      bucketName,
      resourceId,
    });
  }
}
