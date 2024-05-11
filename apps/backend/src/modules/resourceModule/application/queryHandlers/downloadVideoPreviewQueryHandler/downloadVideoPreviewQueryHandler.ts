import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type VideoPreview } from '../../../domain/entities/video/videoPreview.js';

export interface DownloadVideoPreviewQueryHandlerPayload {
  readonly userId: string;
  readonly resourceId: string;
  readonly bucketName: string;
}

export interface DownloadVideoPreviewQueryHandlerResult {
  readonly preview: VideoPreview;
}

export type DownloadVideoPreviewQueryHandler = QueryHandler<
  DownloadVideoPreviewQueryHandlerPayload,
  DownloadVideoPreviewQueryHandlerResult
>;
