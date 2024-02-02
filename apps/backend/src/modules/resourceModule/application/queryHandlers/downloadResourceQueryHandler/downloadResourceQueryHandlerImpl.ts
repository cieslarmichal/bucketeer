import {
  type DownloadResourceQueryHandler,
  type DownloadResourceQueryHandlerPayload,
  type DownloadResourceQueryHandlerResult,
} from './downloadResourceQueryHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserDirectoryQueryHandler } from '../../../../userModule/application/queryHandlers/findUserDirectoryQueryHandler/findUserDirectoryQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class DownloadResourceQueryHandlerImpl implements DownloadResourceQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserDirectoryQueryHandler: FindUserDirectoryQueryHandler,
  ) {}

  public async execute(payload: DownloadResourceQueryHandlerPayload): Promise<DownloadResourceQueryHandlerResult> {
    const { userId, resourceName } = payload;

    const { directoryName } = await this.findUserDirectoryQueryHandler.execute({ userId });

    this.loggerService.debug({
      message: 'Downloading Resource...',
      userId,
      directoryName,
      resourceName,
    });

    const resource = await this.resourceBlobSerice.downloadResource({
      bucketName: directoryName,
      resourceName,
    });

    this.loggerService.info({
      message: 'Resource downloaded.',
      userId,
      directoryName,
      resourceName,
    });

    return { resource };
  }
}
