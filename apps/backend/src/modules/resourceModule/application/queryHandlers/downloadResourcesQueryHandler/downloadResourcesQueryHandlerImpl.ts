import archiver from 'archiver';

import {
  type DownloadResourcesQueryHandler,
  type DownloadResourcesQueryHandlerPayload,
  type DownloadResourcesQueryHandlerResult,
} from './downloadResourcesQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class DownloadResourcesQueryHandlerImpl implements DownloadResourcesQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
  ) {}

  public async execute(payload: DownloadResourcesQueryHandlerPayload): Promise<DownloadResourcesQueryHandlerResult> {
    const { userId, names, bucketName } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.includes(bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket does not exist.',
        userId,
        bucketName,
      });
    }

    this.loggerService.debug({
      message: 'Downloading Resources...',
      userId,
      bucketName,
    });

    const blobsNames = await this.resourceBlobSerice.getResourcesNames({ bucketName });

    if (!blobsNames.length) {
      this.loggerService.error({
        message: 'Resources not found.',
        userId,
        bucketName,
        names,
      });

      throw new OperationNotValidError({
        reason: 'Resources not found.',
        bucketName,
        names,
      });
    }

    if (names.length && !names.every((name) => blobsNames.includes(name))) {
      throw new OperationNotValidError({
        reason: 'Provided Resource names do not exist.',
        bucketName,
        names,
      });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });

    let archivedResourcesCount = 0;

    for (const blobName of blobsNames) {
      if (!names.length || names.includes(blobName)) {
        const { data: blobData } = await this.resourceBlobSerice.downloadResource({
          bucketName,
          resourceName: blobName,
        });

        archive.append(blobData, { name: blobName });

        archivedResourcesCount++;
      }
    }

    archive.finalize();

    this.loggerService.debug({
      message: 'Resources downloaded.',
      userId,
      bucketName,
      count: archivedResourcesCount,
    });

    return { resourcesData: archive };
  }
}
