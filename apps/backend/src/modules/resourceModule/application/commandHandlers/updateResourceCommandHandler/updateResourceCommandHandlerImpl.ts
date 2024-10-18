import { UserRole } from '@common/contracts';

import {
  type UpdateResourceCommandHandlerPayload,
  type UpdateResourceCommandHandler,
} from './updateResourceCommandHandler.js';
import { type UuidService } from '../../../../../libs/uuid/services/uuidService/uuidService.js';
import { ForbiddenAccessError } from '../../../../authModule/application/errors/forbiddenAccessError.js';
import { type FindUserBucketsQueryHandler } from '../../../../userModule/application/queryHandlers/findUserBucketsQueryHandler/findUserBucketsQueryHandler.js';
import { type ResourceBlobService } from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class UpdateResourceCommandHandlerImpl implements UpdateResourceCommandHandler {
  public constructor(
    private readonly resourceBlobService: ResourceBlobService,
    private readonly findUserBucketsQueryHandler: FindUserBucketsQueryHandler,
    private readonly uuidService: UuidService,
  ) {}

  public async execute(payload: UpdateResourceCommandHandlerPayload): Promise<void> {
    const { resourceName, resourceId, bucketName, userId, userRole } = payload;

    const { buckets } = await this.findUserBucketsQueryHandler.execute({ userId });

    if (!buckets.some((bucket) => bucket.name === bucketName) && userRole === UserRole.user) {
      throw new ForbiddenAccessError({
        reason: 'User does not have access to this bucket.',
        userId,
        bucketName,
        userBuckets: buckets,
      });
    }

    const newResourceId = this.uuidService.generateUuid();

    const previewsBucketName = bucketName + '-previews';

    await this.resourceBlobService.updateResource({
      ...payload,
      newResourceId,
    });

    await Promise.all([
      this.resourceBlobService.updateResource({
        bucketName,
        resourceId,
        resourceName,
        newResourceId,
      }),
      this.resourceBlobService.updateResource({
        bucketName: bucketName + '-previews',
        resourceId,
        resourceName: previewsBucketName,
        newResourceId,
      }),
    ]);

    await Promise.all([
      this.resourceBlobService.deleteResource({
        bucketName,
        resourceId,
      }),
      this.resourceBlobService.deleteResource({
        bucketName: previewsBucketName,
        resourceId,
      }),
    ]);
  }
}
