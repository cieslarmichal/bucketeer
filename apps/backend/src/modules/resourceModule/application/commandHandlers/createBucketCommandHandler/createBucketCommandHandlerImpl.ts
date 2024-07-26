/* eslint-disable @typescript-eslint/naming-convention */
import { BucketAlreadyExists, CreateBucketCommand, ListBucketsCommand } from '@aws-sdk/client-s3';

import {
  type CreateBucketCommandHandlerResult,
  type CreateBucketCommandHandler,
  type CreateBucketCommandHandlerPayload,
} from './createBucketCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type S3Client } from '../../../../../libs/s3/clients/s3Client/s3Client.js';

export class CreateBucketCommandHandlerImpl implements CreateBucketCommandHandler {
  public constructor(
    private readonly s3Client: S3Client,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: CreateBucketCommandHandlerPayload): Promise<CreateBucketCommandHandlerResult> {
    const { bucketName } = payload;

    const result = await this.s3Client.send(new ListBucketsCommand({}));

    if (result.Buckets?.find((bucket) => bucket.Name === bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket already exists.',
        bucketName,
      });
    }

    const bucketPreviewsName = `${bucketName}-previews`;

    this.loggerService.debug({
      message: 'Creating Buckets...',
      bucketName,
      bucketPreviewsName,
    });

    try {
      await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));

      await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketPreviewsName }));
    } catch (error) {
      if (error instanceof BucketAlreadyExists) {
        throw new OperationNotValidError({
          reason: 'Bucket already exists.',
          bucketName,
          bucketPreviewsName,
        });
      }

      throw new OperationNotValidError({
        reason: 'Error creating bucket.',
        bucketName,
        error,
      });
    }

    this.loggerService.debug({
      message: 'Buckets created.',
      bucketName,
    });

    return {
      bucket: {
        name: bucketName,
      },
    };
  }
}
