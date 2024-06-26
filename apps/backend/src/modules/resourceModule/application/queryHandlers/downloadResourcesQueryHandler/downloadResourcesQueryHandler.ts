import { type Readable } from 'node:stream';

import { type QueryHandler } from '../../../../../common/types/queryHandler.js';

export interface DownloadResourcesQueryHandlerPayload {
  readonly userId: string;
  readonly ids: string[];
  readonly bucketName: string;
}

export interface DownloadResourcesQueryHandlerResult {
  readonly resourcesData: Readable;
}

export type DownloadResourcesQueryHandler = QueryHandler<
  DownloadResourcesQueryHandlerPayload,
  DownloadResourcesQueryHandlerResult
>;
