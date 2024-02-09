import {
  type DownloadResourceQueryHandler,
  type DownloadResourceQueryHandlerPayload,
  type DownloadResourceQueryHandlerResult,
} from './downloadResourceQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class DownloadResourceQueryHandlerImpl implements DownloadResourceQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
  ) {}

  public async execute(payload: DownloadResourceQueryHandlerPayload): Promise<DownloadResourceQueryHandlerResult> {
    const { userId, resourceName, bucketName } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.includes(bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket does not exist.',
        userId,
        bucketName,
      });
    }

    this.loggerService.debug({
      message: 'Downloading Resource...',
      userId,
      bucketName,
      resourceName,
    });

    const resource = await this.resourceBlobSerice.downloadResource({
      bucketName,
      resourceName,
    });

    this.loggerService.debug({
      message: 'Resource downloaded.',
      userId,
      bucketName,
      resourceName,
    });

    return { resource };
  }
}
