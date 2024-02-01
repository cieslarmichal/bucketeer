import { type QueryHandler } from '../../../../../common/types/queryHandler.js';
import { type User } from '../../../domain/entities/user/user.js';

export interface FindUserQueryHandlerPayload {
  readonly userId: string;
}

export interface FindUserQueryHandlerResult {
  readonly user: User;
}

export type FindUserQueryHandler = QueryHandler<FindUserQueryHandlerPayload, FindUserQueryHandlerResult>;
