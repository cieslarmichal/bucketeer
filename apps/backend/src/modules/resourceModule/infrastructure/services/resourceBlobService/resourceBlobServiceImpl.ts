/* eslint-disable @typescript-eslint/naming-convention */

import {
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  ListBucketsCommand,
  ListObjectsV2Command,
  type ListObjectsV2CommandInput,
} from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
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
  type GetResourcesIdsPayload,
  type UploadResourcePayload,
} from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class ResourceBlobServiceImpl implements ResourceBlobService {
  public constructor(private readonly s3Client: S3Client) {}

  public async uploadResource(payload: UploadResourcePayload): Promise<void> {
    const { bucketName, resourceId, resourceName, data, contentType } = payload;

    const upload = new Upload({
      client: this.s3Client,
      params: {
        Bucket: bucketName,
        Key: resourceId,
        Body: data,
        Metadata: {
          actualname: encodeURIComponent(resourceName),
        },
        ContentType: contentType,
      },
    });

    await upload.done();
  }

  public async downloadResource(payload: DownloadResourcePayload): Promise<Resource> {
    const { resourceId, bucketName } = payload;

    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: resourceId,
    });

    const result = await this.s3Client.send(command);

    return {
      name: decodeURIComponent(result.Metadata?.['actualname'] ?? ''),
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

    const bucketPreviewsName = `${bucketName}-previews`;

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

      if (totalPages === page && result.Contents) {
        resourcesMetadata = await Promise.all(
          result.Contents.map(async (resultEntry) => {
            const { Key, LastModified, Size } = resultEntry;

            const [url, previewUrl, metadataResult] = await Promise.all([
              getSignedUrl(
                this.s3Client,
                new GetObjectCommand({
                  Bucket: bucketName,
                  Key: Key as string,
                }),
                { expiresIn: 86400 },
              ),
              getSignedUrl(
                this.s3Client,
                new GetObjectCommand({
                  Bucket: bucketPreviewsName,
                  Key: Key as string,
                }),
                { expiresIn: 86400 },
              ),
              this.s3Client.send(
                new HeadObjectCommand({
                  Bucket: bucketName,
                  Key: Key as string,
                }),
              ),
            ]);

            return {
              id: Key as string,
              name: decodeURIComponent(metadataResult.Metadata?.['actualname'] ?? ''),
              updatedAt: LastModified as Date,
              contentSize: Size as number,
              contentType: metadataResult.ContentType as string,
              url,
              previewUrl,
            };
          }),
        );
      }

      continuationToken = result.NextContinuationToken;
    } while (continuationToken);

    return {
      items: resourcesMetadata,
      totalPages,
    };
  }

  public async getResourcesIds(payload: GetResourcesIdsPayload): Promise<string[]> {
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
    const { resourceId, bucketName } = payload;

    try {
      const resourcesIds = await this.getResourcesIds({ bucketName });

      return resourcesIds.includes(resourceId);
    } catch (error) {
      return false;
    }
  }

  public async bucketExists(payload: { bucketName: string }): Promise<boolean> {
    const { bucketName } = payload;

    const result = await this.s3Client.send(new ListBucketsCommand({}));

    return result.Buckets?.find((bucket) => bucket.Name === bucketName) !== undefined;
  }

  public async deleteResource(payload: DeleteResourcePayload): Promise<void> {
    const { resourceId, bucketName } = payload;

    const exists = await this.resourceExists({
      resourceId,
      bucketName,
    });

    if (!exists) {
      throw new OperationNotValidError({
        reason: 'Resource does not exist in bucket.',
        resourceId,
        bucketName,
      });
    }

    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: resourceId,
    });

    await this.s3Client.send(command);
  }
}
