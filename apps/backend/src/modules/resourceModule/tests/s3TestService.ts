/* eslint-disable @typescript-eslint/naming-convention */

import { ListObjectsV2Command, PutObjectCommand } from '@aws-sdk/client-s3';
import { existsSync, readFileSync } from 'node:fs';

import { type S3Client } from '../../../libs/s3/clients/s3Client/s3Client.js';

export class S3TestService {
  public constructor(private readonly s3Client: S3Client) {}

  public async objectExists(bucketName: string, objectKey: string): Promise<boolean> {
    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    const result = await this.s3Client.send(command);

    if (!result.Contents) {
      return false;
    }

    return result.Contents.some((metadata) => metadata.Key === objectKey);
  }

  public async uploadObject(
    bucketName: string,
    objectKey: string,
    filePath: string,
    contentType?: string,
  ): Promise<void> {
    if (await this.objectExists(bucketName, objectKey)) {
      return;
    }

    if (existsSync(filePath)) {
      const objectData = readFileSync(filePath);

      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: objectKey,
        Body: objectData,
        ContentType: contentType ?? 'application/octet-stream',
      });

      await this.s3Client.send(command);
    }
  }
}
