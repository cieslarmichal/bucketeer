import { type PreviewType } from './previewType.js';

export interface DownloadVideoPreviewPathParams {
  readonly bucketName: string;
  readonly resourceId: string;
}

export interface DownloadVideoPreviewQueryParams {
  readonly previewType: PreviewType;
}
