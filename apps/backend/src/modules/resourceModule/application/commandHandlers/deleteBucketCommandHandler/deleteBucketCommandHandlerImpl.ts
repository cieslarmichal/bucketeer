/* eslint-disable @typescript-eslint/naming-convention */

import { DeleteBucketCommand, ListBucketsCommand, type S3Client } from '@aws-sdk/client-s3';

import {
  type DeleteBucketCommandHandlerPayload,
  type DeleteBucketCommandHandler,
} from './deleteBucketCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';

export class DeleteBucketCommandHandlerImpl implements DeleteBucketCommandHandler {
  public constructor(
    private readonly s3Client: S3Client,
    private readonly loggerService: LoggerService,
  ) {}

  public async execute(payload: DeleteBucketCommandHandlerPayload): Promise<void> {
    const { bucketName } = payload;

    const bucketPreviewsName = `${bucketName}-previews`;

    const result = await this.s3Client.send(new ListBucketsCommand({}));

    [bucketName, bucketPreviewsName].forEach((bucketName) => {
      if (!result.Buckets?.find((bucket) => bucket.Name === bucketName)) {
        throw new OperationNotValidError({
          reason: 'Bucket does not exist.',
          bucketName,
        });
      }
    });

    this.loggerService.debug({
      message: 'Deleting Buckets...',
      bucketName,
      bucketPreviewsName,
    });

    await this.s3Client.send(new DeleteBucketCommand({ Bucket: bucketName }));

    await this.s3Client.send(new DeleteBucketCommand({ Bucket: bucketPreviewsName }));

    this.loggerService.debug({
      message: 'Buckets deleted.',
      bucketName,
      bucketPreviewsName,
    });
  }
}
