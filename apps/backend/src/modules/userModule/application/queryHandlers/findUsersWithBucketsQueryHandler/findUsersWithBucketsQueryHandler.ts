import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type UserWithBuckets } from '../../../domain/entities/user/user.js';

export interface FindUsersWithBucketsQueryHandlerPayload {
  readonly page: number;
  readonly pageSize: number;
}

export interface FindUsersWithBucketsQueryHandlerResult {
  readonly users: UserWithBuckets[];
  readonly totalUsers: number;
}

export type FindUsersWithBucketsQueryHandler = QueryHandler<
  FindUsersWithBucketsQueryHandlerPayload,
  FindUsersWithBucketsQueryHandlerResult
>;
