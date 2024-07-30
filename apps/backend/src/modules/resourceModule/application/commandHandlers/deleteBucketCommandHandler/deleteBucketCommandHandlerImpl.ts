/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */

import {
  DeleteBucketCommand,
  DeleteObjectsCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  type S3Client,
} from '@aws-sdk/client-s3';

import {
  type DeleteBucketCommandHandlerPayload,
  type DeleteBucketCommandHandler,
} from './deleteBucketCommandHandler.js';
import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type LoggerService } from '../../../../../libs/logger/services/loggerService/loggerService.js';
import { type UserBucketRepository } from '../../../../userModule/domain/repositories/userBucketRepository/userBucketRepository.js';

export class DeleteBucketCommandHandlerImpl implements DeleteBucketCommandHandler {
  public constructor(
    private readonly s3Client: S3Client,
    private readonly userBucketRepository: UserBucketRepository,
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

    await Promise.all([this.deleteAllObjects(bucketName), this.deleteAllObjects(bucketPreviewsName)]);

    await Promise.all([
      this.s3Client.send(new DeleteBucketCommand({ Bucket: bucketName })),
      this.s3Client.send(new DeleteBucketCommand({ Bucket: bucketPreviewsName })),
    ]);

    const userBuckets = await this.userBucketRepository.findUserBuckets({ bucketName });

    await Promise.all(
      userBuckets.map((userBucket) =>
        this.userBucketRepository.deleteUserBucket({
          bucketName,
          userId: userBucket.getUserId(),
        }),
      ),
    );

    this.loggerService.debug({
      message: 'Buckets deleted.',
      bucketName,
      bucketPreviewsName,
    });
  }

  private async deleteAllObjects(bucketName: string): Promise<void> {
    let isTruncated = true;

    let continuationToken: string | undefined = undefined;

    while (isTruncated) {
      const commandInput: ListObjectsV2CommandInput = {
        Bucket: bucketName,
      };

      if (continuationToken) {
        commandInput.ContinuationToken = continuationToken;
      }

      const listObjectsResponse = await this.s3Client.send(new ListObjectsV2Command(commandInput));

      if (listObjectsResponse.Contents && listObjectsResponse.Contents.length > 0) {
        const deleteParams = {
          Bucket: bucketName,
          Delete: {
            Objects: listObjectsResponse.Contents.map((object: any) => ({ Key: object.Key! })),
          },
        };

        await this.s3Client.send(new DeleteObjectsCommand(deleteParams));
      }

      isTruncated = listObjectsResponse.IsTruncated ?? false;

      continuationToken = listObjectsResponse.NextContinuationToken;
    }
  }
}
