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
    const { userId, ids, bucketName } = payload;

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

    const blobsIds = await this.resourceBlobSerice.getResourcesIds({ bucketName });

    if (!blobsIds.length) {
      this.loggerService.error({
        message: 'Resources not found.',
        userId,
        bucketName,
        ids,
      });

      throw new OperationNotValidError({
        reason: 'Resources not found.',
        bucketName,
        ids,
      });
    }

    if (ids.length && !ids.every((id) => blobsIds.includes(id))) {
      throw new OperationNotValidError({
        reason: 'Resources with given ids do not exist.',
        bucketName,
        ids,
      });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });

    let archivedResourcesCount = 0;

    for (const blobId of blobsIds) {
      if (!ids.length || ids.includes(blobId)) {
        const { data: blobData, name } = await this.resourceBlobSerice.downloadResource({
          bucketName,
          resourceId: blobId,
        });

        archive.append(blobData, { name });

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
