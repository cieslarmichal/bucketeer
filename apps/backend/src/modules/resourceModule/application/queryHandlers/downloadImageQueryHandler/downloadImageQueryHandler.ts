import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Resource } from '../../../domain/entities/resource/resource.js';

export interface DownloadImageQueryHandlerPayload {
  readonly userId: string;
  readonly resourceName: string;
  readonly bucketName: string;
  readonly width: number;
  readonly height: number;
}

export interface DownloadImageQueryHandlerResult {
  readonly resource: Resource;
}

export type DownloadImageQueryHandler = QueryHandler<DownloadImageQueryHandlerPayload, DownloadImageQueryHandlerResult>;
