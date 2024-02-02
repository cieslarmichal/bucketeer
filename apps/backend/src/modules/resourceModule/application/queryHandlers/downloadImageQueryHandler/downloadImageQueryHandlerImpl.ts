import sharp from 'sharp';

import {
  type DownloadImageQueryHandler,
  type DownloadImageQueryHandlerPayload,
  type DownloadImageQueryHandlerResult,
} from './downloadImageQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserDirectoryQueryHandler } from '../../../../userModule/application/queryHandlers/findUserDirectoryQueryHandler/findUserDirectoryQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class DownloadImageQueryHandlerImpl implements DownloadImageQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserDirectoryQueryHandler: FindUserDirectoryQueryHandler,
  ) {}

  public async execute(payload: DownloadImageQueryHandlerPayload): Promise<DownloadImageQueryHandlerResult> {
    const { userId, resourceName, width, height } = payload;

    const { directoryName } = await this.findUserDirectoryQueryHandler.execute({ userId });

    this.loggerService.debug({
      message: 'Downloading Image Resource...',
      userId,
      directoryName,
      resourceName,
      width,
      height,
    });

    const resource = await this.resourceBlobSerice.downloadResource({
      bucketName: directoryName,
      resourceName,
    });

    const imagesExtensions = ['jpg', 'jpeg', 'tiff', 'webp', 'raw', 'png'];

    if (!imagesExtensions.some((ext) => resourceName.toLowerCase().endsWith(`.${ext}`))) {
      throw new OperationNotValidError({
        reason: 'Resource is not an image.',
        userId,
        directoryName,
        resourceName,
      });
    }

    const resizing = sharp().resize({
      width,
      height,
      fit: 'inside',
    });

    const resizedImageData = resource.data.pipe(resizing);

    this.loggerService.info({
      message: 'Image Resource downloaded.',
      userId,
      directoryName,
      resourceName,
      width,
      height,
    });

    return {
      resource: {
        name: resource.name,
        updatedAt: resource.updatedAt,
        contentType: resource.contentType,
        contentSize: resource.contentSize,
        data: resizedImageData,
      },
    };
  }
}
