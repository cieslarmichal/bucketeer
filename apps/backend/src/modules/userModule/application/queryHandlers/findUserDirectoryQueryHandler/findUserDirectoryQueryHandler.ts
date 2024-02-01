import { type QueryHandler } from '../../../../../common/types/queryHandler.js';

export interface FindUserDirectoryQueryHandlerPayload {
  readonly userId: string;
}

export interface FindUserDirectoryQueryHandlerResult {
  readonly directoryName: string;
}

export type FindUserDirectoryQueryHandler = QueryHandler<
  FindUserDirectoryQueryHandlerPayload,
  FindUserDirectoryQueryHandlerResult
>;
