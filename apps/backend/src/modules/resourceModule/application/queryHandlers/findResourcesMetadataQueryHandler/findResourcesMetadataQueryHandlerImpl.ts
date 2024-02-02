import {
  type FindResourcesMetadataQueryHandler,
  type FindResourcesMetadataQueryHandlerPayload,
  type FindResourcesMetadataQueryHandlerResult,
} from './findResourcesMetadataQueryHandler.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserDirectoryQueryHandler } from '../../../../userModule/application/queryHandlers/findUserDirectoryQueryHandler/findUserDirectoryQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class FindResourcesMetadataQueryHandlerImpl implements FindResourcesMetadataQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserDirectoryQueryHandler: FindUserDirectoryQueryHandler,
  ) {}

  public async execute(
    payload: FindResourcesMetadataQueryHandlerPayload,
  ): Promise<FindResourcesMetadataQueryHandlerResult> {
    const { userId, page, pageSize } = payload;

    const { directoryName } = await this.findUserDirectoryQueryHandler.execute({ userId });

    this.loggerService.debug({
      message: 'Fetching Resources...',
      userId,
      directoryName,
      page,
      pageSize,
    });

    const { items: resourcesMetadata, totalPages } = await this.resourceBlobSerice.getResourcesMetadata({
      bucketName: directoryName,
      page,
      pageSize,
    });

    this.loggerService.info({
      message: 'Resources fetched.',
      userId,
      directoryName,
      page,
      pageSize,
    });

    return {
      resourcesMetadata,
      totalPages,
    };
  }
}
