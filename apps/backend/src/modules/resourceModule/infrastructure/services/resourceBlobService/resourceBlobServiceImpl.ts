/* eslint-disable @typescript-eslint/naming-convention */

import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { type Readable } from 'node:stream';

import { OperationNotValidError } from '../../../../../common/errors/common/operationNotValidError.js';
import { type S3Client } from '../../../../../libs/s3/clients/s3Client/s3Client.js';
import { type Resource } from '../../../domain/entities/resource/resource.js';
import { type ResourceMetadata } from '../../../domain/entities/resource/resourceMetadata.js';
import {
  type ResourceExistsPayload,
  type DeleteResourcePayload,
  type GetResourcesMetadataPayload,
  type ResourceBlobService,
  type DownloadResourcePayload,
  type GetResourcesMetadataResult,
  type GetResourcesNamesPayload,
  type UploadResourcePayload,
} from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class ResourceBlobServiceImpl implements ResourceBlobService {
  public constructor(private readonly s3Client: S3Client) {}

  public async uploadResource(payload: UploadResourcePayload): Promise<void> {
    const { bucketName, resourceName, data } = payload;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucketName,
        Key: resourceName,
        Body: data,
      },
    });

    await upload.done();
  }

  public async downloadResource(payload: DownloadResourcePayload): Promise<Resource> {
    const { resourceName, bucketName } = payload;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: resourceName,
    });

    const result = await this.s3Client.send(command);

    return {
      name: resourceName,
      updatedAt: result.LastModified as Date,
      contentSize: result.ContentLength as number,
      contentType: result.ContentType as string,
      data: result.Body as Readable,
    };
  }

  public async getResourcesMetadata(payload: GetResourcesMetadataPayload): Promise<GetResourcesMetadataResult> {
    const { bucketName, page, pageSize } = payload;

    let resourcesMetadata: ResourceMetadata[] = [];

    let totalPages = 0;

    let continuationToken: string | undefined = undefined;

    do {
      const commandInput: ListObjectsV2CommandInput = {
        Bucket: bucketName,
        MaxKeys: pageSize,
      };

      if (continuationToken) {
        commandInput.ContinuationToken = continuationToken;
      }

      const command = new ListObjectsV2Command(commandInput);

      const result = await this.s3Client.send(command);

      totalPages++;

      if (totalPages === page) {
        resourcesMetadata = result.Contents
          ? result.Contents.map((resultEntry) => {
              const { Key, LastModified, Size } = resultEntry;

              return {
                name: Key as string,
                updatedAt: LastModified as Date,
                contentSize: Size as number,
              };
            })
          : [];
      }

      continuationToken = result.NextContinuationToken;
    } while (continuationToken);

    return {
      items: resourcesMetadata,
      totalPages,
    };
  }

  public async getResourcesNames(payload: GetResourcesNamesPayload): Promise<string[]> {
    const { bucketName } = payload;

    const command = new ListObjectsV2Command({
      Bucket: bucketName,
    });

    const result = await this.s3Client.send(command);

    if (!result.Contents) {
      return [];
    }

    return result.Contents.map((metadata) => metadata.Key as string);
  }

  public async resourceExists(payload: ResourceExistsPayload): Promise<boolean> {
    const { resourceName, bucketName } = payload;

    try {
      const resourcesNames = await this.getResourcesNames({ bucketName });

      return resourcesNames.includes(resourceName);
    } catch (error) {
      return false;
    }
  }

  public async deleteResource(payload: DeleteResourcePayload): Promise<void> {
    const { resourceName, bucketName } = payload;

    const exists = await this.resourceExists({
      resourceName,
      bucketName,
    });

    if (!exists) {
      throw new OperationNotValidError({
        reason: 'Resource does not exist in bucket.',
        resourceName,
        bucketName,
      });
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: resourceName,
    });

    await this.s3Client.send(command);
  }
}
