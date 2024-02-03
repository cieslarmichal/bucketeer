import { type QueryHandler } from '../../../../../common/types/queryHandler.js';

export interface FindUserBucketsQueryHandlerPayload {
  readonly userId: string;
}

export interface FindUserBucketsQueryHandlerResult {
  readonly buckets: string[];
}

export type FindUserBucketsQueryHandler = QueryHandler<
  FindUserBucketsQueryHandlerPayload,
  FindUserBucketsQueryHandlerResult
>;
