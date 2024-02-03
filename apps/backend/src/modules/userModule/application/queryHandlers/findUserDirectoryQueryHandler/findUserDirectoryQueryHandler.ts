import { type QueryHandler } from '../../../../../common/types/queryHandler.js';

export interface FindUserBucketQueryHandlerPayload {
  readonly userId: string;
}

export interface FindUserBucketQueryHandlerResult {
  readonly directoryName: string;
}

export type FindUserBucketQueryHandler = QueryHandler<
  FindUserBucketQueryHandlerPayload,
  FindUserBucketQueryHandlerResult
>;
