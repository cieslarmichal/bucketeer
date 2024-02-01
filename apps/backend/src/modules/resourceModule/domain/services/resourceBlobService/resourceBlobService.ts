import { type Resource } from '../../entities/resource/resource.js';
import { type ResourceMetadata } from '../../entities/resource/resourceMetadata.js';

export interface ResourceExistsPayload {
  readonly resourceName: string;
  readonly directoryName: string;
}

export interface DownloadResourcePayload {
  readonly resourceName: string;
  readonly directoryName: string;
}

export interface ListResourcesMetadataPayload {
  readonly directoryName: string;
  readonly page: number;
  readonly pageSize: number;
}

export interface ListResourcesMetadataResult {
  readonly items: ResourceMetadata[];
  readonly totalPages: number;
}

export interface ListResourcesNamesPayload {
  readonly directoryName: string;
}

export interface DeleteResourcePayload {
  readonly resourceName: string;
  readonly directoryName: string;
}

export interface ResourceBlobService {
  resourceExists(payload: ResourceExistsPayload): Promise<boolean>;
  downloadResource(payload: DownloadResourcePayload): Promise<Resource>;
  listResourcesMetadata(payload: ListResourcesMetadataPayload): Promise<ListResourcesMetadataResult>;
  listResourcesNames(payload: ListResourcesNamesPayload): Promise<string[]>;
  deleteResource(payload: DeleteResourcePayload): Promise<void>;
}
