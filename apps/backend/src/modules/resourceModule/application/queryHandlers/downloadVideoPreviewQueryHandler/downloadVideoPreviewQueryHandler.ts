import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Resource } from '../../../domain/entities/resource/resource.js';

export interface DownloadVideoPreviewQueryHandlerPayload {
  readonly userId: string;
  readonly resourceName: string;
  readonly bucketName: string;
}

export interface DownloadVideoPreviewQueryHandlerResult {
  readonly resource: Resource;
}

export type DownloadVideoPreviewQueryHandler = QueryHandler<
  DownloadVideoPreviewQueryHandlerPayload,
  DownloadVideoPreviewQueryHandlerResult
>;
