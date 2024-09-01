import { UserRole } from '@common/contracts';

import {
  type FindResourcesMetadataQueryHandler,
  type FindResourcesMetadataQueryHandlerPayload,
  type FindResourcesMetadataQueryHandlerResult,
} from './findResourcesMetadataQueryHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { ForbiddenAccessError } from '../../../../authModule/application/errors/forbiddenAccessError.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class FindResourcesMetadataQueryHandlerImpl implements FindResourcesMetadataQueryHandler {
  public constructor(
    private readonly resourceBlobSerice: ResourceBlobService,
    private readonly loggerService: LoggerService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
  ) {}

  public async execute(
    payload: FindResourcesMetadataQueryHandlerPayload,
  ): Promise<FindResourcesMetadataQueryHandlerResult> {
    const { userId, page, pageSize, bucketName, userRole } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.some((bucket) => bucket.name === bucketName) && userRole === UserRole.user) {
      throw new ForbiddenAccessError({
        reason: 'User does not have access to this bucket.',
        userId,
        bucketName,
        userBuckets: buckets,
      });
    }

    const bucketExists = await this.resourceBlobSerice.bucketExists({ bucketName });

    if (!bucketExists) {
      throw new OperationNotValidError({
        reason: 'Bucket does not exist.',
        userId,
        bucketName,
      });
    }

    this.loggerService.debug({
      message: 'Fetching Resources...',
      userId,
      bucketName,
      page,
      pageSize,
    });

    const { items: resourcesMetadata, totalPages } = await this.resourceBlobSerice.getResourcesMetadata({
      bucketName,
      page,
      pageSize,
    });

    this.loggerService.debug({
      message: 'Resources fetched.',
      userId,
      bucketName,
      page,
      pageSize,
    });

    return {
      resourcesMetadata,
      totalPages,
    };
  }
}
