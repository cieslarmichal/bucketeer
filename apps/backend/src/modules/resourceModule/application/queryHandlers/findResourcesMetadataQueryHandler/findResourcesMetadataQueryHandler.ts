import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type ResourceMetadata } from '../../../domain/entities/resource/resourceMetadata.js';

export interface FindResourcesMetadataQueryHandlerPayload {
  readonly userId: string;
  readonly page: number;
  readonly pageSize: number;
  readonly bucketName: string;
}

export interface FindResourcesMetadataQueryHandlerResult {
  readonly resourcesMetadata: ResourceMetadata[];
  readonly totalPages: number;
}

export type FindResourcesMetadataQueryHandler = QueryHandler<
  FindResourcesMetadataQueryHandlerPayload,
  FindResourcesMetadataQueryHandlerResult
>;
