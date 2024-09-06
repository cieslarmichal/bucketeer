import archiver from 'archiver';
import { createWriteStream, mkdirSync } from 'node:fs';

import {
  type DownloadResourcesQueryHandler,
  type DownloadResourcesQueryHandlerPayload,
  type DownloadResourcesQueryHandlerResult,
} from './downloadResourcesQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { ForbiddenAccessError } from '../../../../authModule/application/errors/forbiddenAccessError.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class DownloadResourcesQueryHandlerImpl implements DownloadResourcesQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
    private readonly uuidService: UuidService,
  ) {}

  public async execute(payload: DownloadResourcesQueryHandlerPayload): Promise<DownloadResourcesQueryHandlerResult> {
    const { userId, ids, bucketName } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.some((bucket) => bucket.name === bucketName)) {
      throw new ForbiddenAccessError({
        reason: 'User does not have access to this bucket.',
        userId,
        bucketName,
        userBuckets: buckets,
      });
    }

    const blobsIds = await this.resourceBlobSerice.getResourcesIds({ bucketName });

    const tempDir = `/tmp/buckets/${this.uuidService.generateUuid()}`;

    mkdirSync(tempDir, { recursive: true });

    this.loggerService.debug({
      message: 'Downloading Resources...',
      userId,
      bucketName,
      tempDir,
    });

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

    archive.on('error', (error) => {
      this.loggerService.error({
        message: 'Error while creating archive.',
        userId,
        bucketName,
        error,
      });

      throw error;
    });

    archive.on('progress', (progress) => {
      this.loggerService.debug({
        message: 'Archive in progress...',
        progress: progress.entries,
      });
    });

    let archivedResourcesCount = 0;

    for (const blobId of blobsIds) {
      if (!ids.length || ids.includes(blobId)) {
        const { data: blobData, name } = await this.resourceBlobSerice.downloadResource({
          bucketName,
          resourceId: blobId,
        });

        const tempFilePath = `${tempDir}/${blobId}`;

        const writeStream = createWriteStream(tempFilePath);

        await new Promise<void>((resolve, reject) => {
          blobData.pipe(writeStream);

          blobData.on('end', resolve);

          blobData.on('error', reject);
        });

        this.loggerService.debug({
          message: 'Resource downloaded.',
          bucketName,
          resourceId: blobId,
          tempFilePath,
        });

        archive.file(tempFilePath, { name });

        archivedResourcesCount++;
      }
    }

    this.loggerService.debug({
      message: 'Finalizing archive...',
      userId,
      bucketName,
    });

    archive.finalize();

    this.loggerService.debug({
      message: 'Resources downloaded.',
      userId,
      bucketName,
      count: archivedResourcesCount,
      tempDir,
    });

    return { resourcesData: archive };
  }
}
