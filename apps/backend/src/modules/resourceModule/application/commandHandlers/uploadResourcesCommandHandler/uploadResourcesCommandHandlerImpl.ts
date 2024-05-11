import mime from 'mime';
import { createReadStream } from 'node:fs';

import {
  type UploadResourcesCommandHandler,
  type UploadResourcesCommandHandlerPayload,
} from './uploadResourcesCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class UploadResourcesCommandHandlerImpl implements UploadResourcesCommandHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
  ) {}

  public async execute(payload: UploadResourcesCommandHandlerPayload): Promise<void> {
    const { userId, bucketName, files } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.includes(bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket is not assigned to this user.',
        userId,
        bucketName,
      });
    }

    await Promise.all(
      files.map(async (file) => {
        const { name: resourceName, filePath } = file;

        const contentType = mime.getType(filePath);

        if (!contentType) {
          throw new OperationNotValidError({
            reason: 'Content type not found',
            resourceName,
          });
        }

        this.loggerService.debug({
          message: 'Uploading Resource...',
          userId,
          bucketName,
          resourceName,
          contentType,
        });

        const data = createReadStream(filePath);

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
      }),
    );
  }
}
