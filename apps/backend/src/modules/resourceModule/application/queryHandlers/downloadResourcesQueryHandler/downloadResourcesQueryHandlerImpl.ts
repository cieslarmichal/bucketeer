import archiver from 'archiver';

import {
  type DownloadResourcesQueryHandler,
  type DownloadResourcesQueryHandlerPayload,
  type DownloadResourcesQueryHandlerResult,
} from './downloadResourcesQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserDirectoryQueryHandler } from '../../../../userModule/application/queryHandlers/findUserDirectoryQueryHandler/findUserDirectoryQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class DownloadResourcesQueryHandlerImpl implements DownloadResourcesQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserDirectoryQueryHandler: FindUserDirectoryQueryHandler,
  ) {}

  public async execute(payload: DownloadResourcesQueryHandlerPayload): Promise<DownloadResourcesQueryHandlerResult> {
    const { userId, names } = payload;

    const { directoryName } = await this.findUserDirectoryQueryHandler.execute({ userId });

    this.loggerService.debug({
      message: 'Downloading Resources...',
      userId,
      directoryName,
    });

    const blobsNames = await this.resourceBlobSerice.listResourcesNames({ directoryName });

    if (!blobsNames.length) {
      this.loggerService.error({
        message: 'Resources not found.',
        userId,
        directoryName,
        names,
      });

      throw new OperationNotValidError({
        reason: 'Resources not found.',
        directoryName,
        names,
      });
    }

    if (names.length && !names.every((name) => blobsNames.includes(name))) {
      throw new OperationNotValidError({
        reason: 'Provided Resource names do not exist.',
        directoryName,
        names,
      });
    }

    const archive = archiver('zip', { zlib: { level: 9 } });

    let archivedResourcesCount = 0;

    for (const blobName of blobsNames) {
      if (!names.length || names.includes(blobName)) {
        const { data: blobData } = await this.resourceBlobSerice.downloadResource({
          directoryName,
          resourceName: blobName,
        });

        archive.append(blobData, { name: blobName });

        archivedResourcesCount++;
      }
    }

    archive.finalize();

    this.loggerService.info({
      message: 'Resources downloaded.',
      userId,
      directoryName,
      count: archivedResourcesCount,
    });

    return { resourcesData: archive };
  }
}
