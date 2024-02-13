import { type QueryHandler } from '../../../../../common/types/queryHandler.js';

export interface FindBucketsQueryHandlerResult {
  readonly buckets: string[];
}

export type FindBucketsQueryHandler = QueryHandler<void, FindBucketsQueryHandlerResult>;
