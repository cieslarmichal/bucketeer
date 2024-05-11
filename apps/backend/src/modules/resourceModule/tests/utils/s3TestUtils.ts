/* eslint-disable @typescript-eslint/naming-convention */

import {
  CreateBucketCommand,
  DeleteBucketCommand,
  DeleteObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
  PutObjectCommand,
  ListBucketsCommand,
  HeadObjectCommand,
} from '@aws-sdk/client-s3';
import { existsSync, readFileSync } from 'node:fs';

import { type S3Client } from '../../../../libs/s3/clients/s3Client/s3Client.js';

export class S3TestUtils {
  public constructor(private readonly s3Client: S3Client) {}

  public async createBucket(bucketName: string): Promise<void> {
    const command = new CreateBucketCommand({
      Bucket: bucketName,
    });

    await this.s3Client.send(command);
  }

  public async truncateBucket(bucketName: string): Promise<void> {
    let continuationToken: string | undefined = undefined;

    do {
      const commandInput: ListObjectsV2CommandInput = {
        Bucket: bucketName,
      };

      if (continuationToken) {
        commandInput.ContinuationToken = continuationToken;
      }

      const command = new ListObjectsV2Command(commandInput);

      const listResult = await this.s3Client.send(command);

      if (listResult.Contents) {
        for (const item of listResult.Contents) {
          const deleteCommand = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: item.Key as string,
          });

          await this.s3Client.send(deleteCommand);
        }
      }

      continuationToken = listResult.NextContinuationToken;
    } while (continuationToken);
  }

  public async deleteBucket(bucketName: string): Promise<void> {
    const existingBuckets = await this.getBuckets();

    if (!existingBuckets.includes(bucketName)) {
      return;
    }

    await this.truncateBucket(bucketName);

    const command = new DeleteBucketCommand({
      Bucket: bucketName,
    });

    await this.s3Client.send(command);
  }

  public async objectExists(bucketName: string, objectKey: string): Promise<boolean> {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    const result = await this.s3Client.send(command);

    if (!result.Contents) {
      return false;
    }

    for (const resultEntry of result.Contents) {
      const metadataCommand = new HeadObjectCommand({
        Bucket: bucketName,
        Key: resultEntry.Key as string,
      });

      const metadataResult = await this.s3Client.send(metadataCommand);

      const actualName = metadataResult.Metadata?.['actualname'];

      if (actualName === objectKey) {
        return true;
      }
    }

    return false;
  }

  public async uploadObject(bucketName: string, objectKey: string, filePath: string): Promise<void> {
    if (await this.objectExists(bucketName, objectKey)) {
      return;
    }

    if (existsSync(filePath)) {
      const objectData = readFileSync(filePath);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: objectData,
        ContentType: 'application/octet-stream',
        Metadata: {
          actualName: encodeURIComponent(objectKey),
        },
      });

      await this.s3Client.send(command);
    }
  }

  public async deleteObject(bucketName: string, objectKey: string): Promise<void> {
    if (!(await this.objectExists(bucketName, objectKey))) {
      return;
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    await this.s3Client.send(command);
  }

  public async getBuckets(): Promise<string[]> {
    const result = await this.s3Client.send(new ListBucketsCommand({}));

    if (!result.Buckets) {
      return [];
    }

    const buckets = result.Buckets.map((bucket) => bucket.Name as string);

    return buckets;
  }
}
