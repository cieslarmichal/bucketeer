import { type CreateRefreshTokenDomainAction } from './createRefreshTokenDomainAction.js';
import { type UpdateDirectoryDomainAction } from './updateDirectoryDomainAction.js';

export type UserDomainAction = CreateRefreshTokenDomainAction | UpdateDirectoryDomainAction;
