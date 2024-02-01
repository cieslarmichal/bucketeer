import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type Resource } from '../../../domain/entities/resource/resource.js';

export interface DownloadResourceQueryHandlerPayload {
  readonly userId: string;
  readonly resourceName: string;
}

export interface DownloadResourceQueryHandlerResult {
  readonly resource: Resource;
}

export type DownloadResourceQueryHandler = QueryHandler<
  DownloadResourceQueryHandlerPayload,
  DownloadResourceQueryHandlerResult
>;
