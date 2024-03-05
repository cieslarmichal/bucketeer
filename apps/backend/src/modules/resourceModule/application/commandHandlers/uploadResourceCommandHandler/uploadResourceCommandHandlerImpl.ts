import {
  type UploadResourceCommandHandler,
  type UploadResourceCommandHandlerPayload,
} from './uploadResourceCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class UploadResourceCommandHandlerImpl implements UploadResourceCommandHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
  ) {}

  public async execute(payload: UploadResourceCommandHandlerPayload): Promise<void> {
    const { userId, resourceName, bucketName, contentType, data } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.includes(bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket does not exist.',
        userId,
        bucketName,
      });
    }

    this.loggerService.debug({
      message: 'Uploading Resource...',
      userId,
      bucketName,
      resourceName,
      contentType,
    });

    const existingResource = await this.resourceBlobSerice.resourceExists({
      bucketName,
      resourceName,
    });

    if (existingResource) {
      throw new OperationNotValidError({
        reason: 'Cannot create resource because it already exists.',
        resourceName,
        bucketName,
      });
    }

    await this.resourceBlobSerice.uploadResource({
      bucketName,
      resourceName,
      data,
      contentType,
    });

    this.loggerService.debug({
      message: 'Resource uploaded.',
      userId,
      bucketName,
      resourceName,
      contentType,
    });
  }
}
