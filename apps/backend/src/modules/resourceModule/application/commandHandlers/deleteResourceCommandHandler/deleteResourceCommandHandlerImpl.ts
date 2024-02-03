import {
  type DeleteResourceCommandHandler,
  type DeleteResourceCommandHandlerPayload,
} from './deleteResourceCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserBucketQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketQueryHandler/findUserBucketQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class DeleteResourceCommandHandlerImpl implements DeleteResourceCommandHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketQueryHandler: FindUserBucketQueryHandler,
  ) {}

  public async execute(payload: DeleteResourceCommandHandlerPayload): Promise<void> {
    const { userId, resourceName } = payload;

    const { directoryName } = await this.findUserBucketQueryHandler.execute({ userId });

    this.loggerService.debug({
      message: 'Deleting Resource...',
      userId,
      directoryName,
      resourceName,
    });

    const existingResource = await this.resourceBlobSerice.resourceExists({
      bucketName: directoryName,
      resourceName,
    });

    if (!existingResource) {
      throw new OperationNotValidError({
        reason: 'Cannot delete resource because it does not exist.',
        resourceName,
        directoryName,
      });
    }

    await this.resourceBlobSerice.deleteResource({
      bucketName: directoryName,
      resourceName,
    });

    this.loggerService.info({
      message: 'Resource deleted.',
      userId,
      directoryName,
      resourceName,
    });
  }
}
