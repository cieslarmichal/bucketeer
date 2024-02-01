import { type UserDomainActionType } from './userDomainActionType.js';

export interface CreateRefreshTokenDomainAction {
  actionName: UserDomainActionType.createRefreshToken;
  payload: {
    token: string;
    expiresAt: Date;
  };
}
