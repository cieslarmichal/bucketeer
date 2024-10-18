import { type Readable } from 'node:stream';

import { type Resource } from '../../entities/resource/resource.js';
import { type ResourceMetadata } from '../../entities/resource/resourceMetadata.js';

export interface UploadResourcePayload {
  readonly resourceId: string;
  readonly resourceName: string;
  readonly bucketName: string;
  readonly data: Readable;
  readonly contentType: string;
}

export interface RenameResourcePayload {
  bucketName: string;
  resourceName: string;
  resourceId: string;
  newResourceId: string;
}

export interface DownloadResourcePayload {
  readonly resourceId: string;
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

export interface GetResourcesIdsPayload {
  readonly bucketName: string;
}

export interface ResourceExistsPayload {
  readonly resourceId: string;
  readonly bucketName: string;
}

export interface BucketExistsPayload {
  readonly bucketName: string;
}

export interface DeleteResourcePayload {
  readonly resourceId: string;
  readonly bucketName: string;
}

export interface ResourceBlobService {
  uploadResource(payload: UploadResourcePayload): Promise<void>;
  updateResource(payload: RenameResourcePayload): Promise<void>;
  downloadResource(payload: DownloadResourcePayload): Promise<Resource>;
  getResourcesMetadata(payload: GetResourcesMetadataPayload): Promise<GetResourcesMetadataResult>;
  getResourcesIds(payload: GetResourcesIdsPayload): Promise<string[]>;
  resourceExists(payload: ResourceExistsPayload): Promise<boolean>;
  bucketExists(payload: BucketExistsPayload): Promise<boolean>;
  deleteResource(payload: DeleteResourcePayload): Promise<void>;
}
