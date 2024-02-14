/* eslint-disable @typescript-eslint/naming-convention */
import { CreateBucketCommand, ListBucketsCommand } from '@aws-sdk/client-s3';

import {
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

  public async execute(payload: CreateBucketCommandHandlerPayload): Promise<void> {
    const { bucketName } = payload;

    const result = await this.s3Client.send(new ListBucketsCommand({}));

    if (result.Buckets?.find((bucket) => bucket.Name === bucketName)) {
      throw new OperationNotValidError({
        reason: 'Bucket already  exists.',
        bucketName,
      });
    }

    this.loggerService.debug({
      message: 'Creating Bucket...',
      bucketName,
    });

    await this.s3Client.send(new CreateBucketCommand({ Bucket: bucketName }));

    this.loggerService.debug({
      message: 'Bucket created.',
      bucketName,
    });
  }
}
