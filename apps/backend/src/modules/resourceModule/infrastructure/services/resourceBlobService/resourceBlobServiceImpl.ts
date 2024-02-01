import { type Readable } from 'node:stream';

import { type ConfigProvider } from '../../../../../core/configProvider.js';
import { type AzureBlobService } from '../../../../../libs/azureBlob/services/azureBlobService/azureBlobService.js';
import { type Resource } from '../../../domain/entities/resource/resource.js';
import {
  type ResourceExistsPayload,
  type DeleteResourcePayload,
  type ListResourcesMetadataPayload,
  type ResourceBlobService,
  type DownloadResourcePayload,
  type ListResourcesMetadataResult,
  type ListResourcesNamesPayload,
} from '../../../domain/services/resourceBlobService/resourceBlobService.js';

export class ResourceBlobServiceImpl implements ResourceBlobService {
  public constructor(
    private readonly azureBlobService: AzureBlobService,
    private readonly configProvider: ConfigProvider,
  ) {}

  public async resourceExists(payload: ResourceExistsPayload): Promise<boolean> {
    const { resourceName, directoryName } = payload;

    const resourcePrefix = this.configProvider.getAzureStorageContainerResourcesPrefix();

    const blobName = resourcePrefix.length > 0 ? `${resourcePrefix}/${resourceName}` : resourceName;

    return this.azureBlobService.blobExists({
      containerName: directoryName,
      blobName,
    });
  }

  public async downloadResource(payload: DownloadResourcePayload): Promise<Resource> {
    const { resourceName, directoryName } = payload;

    const resourcePrefix = this.configProvider.getAzureStorageContainerResourcesPrefix();

    const blobName = resourcePrefix.length > 0 ? `${resourcePrefix}/${resourceName}` : resourceName;

    const { name, updatedAt, contentSize, contentType, data } = await this.azureBlobService.downloadBlob({
      containerName: directoryName,
      blobName,
    });

    return {
      name,
      updatedAt,
      contentSize,
      contentType,
      data: data as Readable,
    };
  }

  public async listResourcesMetadata(payload: ListResourcesMetadataPayload): Promise<ListResourcesMetadataResult> {
    const { directoryName, page, pageSize } = payload;

    const resourcePrefix = this.configProvider.getAzureStorageContainerResourcesPrefix();

    const { items: blobsMetadata, totalPages } = await this.azureBlobService.getBlobsMetadata({
      containerName: directoryName,
      page,
      pageSize,
      prefix: resourcePrefix,
    });

    const resourcesMetadata = blobsMetadata.map((blobMetadata) => {
      const { name, updatedAt, contentSize, contentType } = blobMetadata;

      return {
        name: resourcePrefix.length > 0 ? name.replace(`${resourcePrefix}/`, '') : name,
        updatedAt,
        contentSize,
        contentType,
      };
    });

    return {
      items: resourcesMetadata,
      totalPages,
    };
  }

  public async listResourcesNames(payload: ListResourcesNamesPayload): Promise<string[]> {
    const { directoryName } = payload;

    const resourcePrefix = this.configProvider.getAzureStorageContainerResourcesPrefix();

    const blobsNames = await this.azureBlobService.getBlobsNames({
      containerName: directoryName,
      prefix: resourcePrefix,
    });

    const resourcesNames = blobsNames.map((blobName) =>
      resourcePrefix.length > 0 ? blobName.replace(`${resourcePrefix}/`, '') : blobName,
    );

    return resourcesNames;
  }

  public async deleteResource(payload: DeleteResourcePayload): Promise<void> {
    const { resourceName, directoryName } = payload;

    const resourcePrefix = this.configProvider.getAzureStorageContainerResourcesPrefix();

    const blobName = resourcePrefix.length > 0 ? `${resourcePrefix}/${resourceName}` : resourceName;

    await this.azureBlobService.deleteBlob({
      containerName: directoryName,
      blobName,
    });
  }
}
