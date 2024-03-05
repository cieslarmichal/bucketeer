import { type Readable } from 'node:stream';

import { type Resource } from '../../entities/resource/resource.js';
import { type ResourceMetadata } from '../../entities/resource/resourceMetadata.js';

export interface UploadResourcePayload {
  readonly resourceName: string;
  readonly bucketName: string;
  readonly data: Readable;
  readonly contentType: string;
}

export interface DownloadResourcePayload {
  readonly resourceName: string;
  readonly bucketName: string;
}

export interface GetResourcesMetadataPayload {
  readonly bucketName: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface GetResourcesMetadataResult {
  readonly items: ResourceMetadata[];
  readonly totalPages: number;
}

export interface GetResourcesNamesPayload {
  readonly bucketName: string;
}

export interface ResourceExistsPayload {
  readonly resourceName: string;
  readonly bucketName: string;
}

export interface DeleteResourcePayload {
  readonly resourceName: string;
  readonly bucketName: string;
}

export interface ResourceBlobService {
  uploadResource(payload: UploadResourcePayload): Promise<void>;
  downloadResource(payload: DownloadResourcePayload): Promise<Resource>;
  getResourcesMetadata(payload: GetResourcesMetadataPayload): Promise<GetResourcesMetadataResult>;
  getResourcesNames(payload: GetResourcesNamesPayload): Promise<string[]>;
  resourceExists(payload: ResourceExistsPayload): Promise<boolean>;
  deleteResource(payload: DeleteResourcePayload): Promise<void>;
}
