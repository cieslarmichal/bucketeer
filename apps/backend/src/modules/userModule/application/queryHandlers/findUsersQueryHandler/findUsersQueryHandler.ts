import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type User } from '../../../domain/entities/user/user.js';

export interface FindUsersQueryHandlerPayload {
  readonly page: number;
  readonly pageSize: number;
}

export interface FindUsersQueryHandlerResult {
  readonly users: User[];
  readonly totalUsers: number;
}

export type FindUsersQueryHandler = QueryHandler<FindUsersQueryHandlerPayload, FindUsersQueryHandlerResult>;
