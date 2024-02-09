import sharp from 'sharp';

import {
  type DownloadImageQueryHandler,
  type DownloadImageQueryHandlerPayload,
  type DownloadImageQueryHandlerResult,
} from './downloadImageQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class DownloadImageQueryHandlerImpl implements DownloadImageQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
  ) {}

  public async execute(payload: DownloadImageQueryHandlerPayload): Promise<DownloadImageQueryHandlerResult> {
    const { userId, resourceName, bucketName, width, height } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.includes(bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket does not exist.',
        userId,
        bucketName,
      });
    }

    this.loggerService.debug({
      message: 'Downloading Image Resource...',
      userId,
      bucketName,
      resourceName,
      width,
      height,
    });

    const resource = await this.resourceBlobSerice.downloadResource({
      bucketName,
      resourceName,
    });

    const imagesExtensions = ['jpg', 'jpeg', 'tiff', 'webp', 'raw', 'png'];

    if (!imagesExtensions.some((ext) => resourceName.toLowerCase().endsWith(`.${ext}`))) {
      throw new OperationNotValidError({
        reason: 'Resource is not an image.',
        userId,
        bucketName,
        resourceName,
      });
    }

    const resizing = sharp().resize({
      width,
      height,
      fit: 'inside',
    });

    const resizedImageData = resource.data.pipe(resizing);

    this.loggerService.debug({
      message: 'Image Resource downloaded.',
      userId,
      bucketName,
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
