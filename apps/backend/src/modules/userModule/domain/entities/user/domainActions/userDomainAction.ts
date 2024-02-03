import { type CreateRefreshTokenDomainAction } from './createRefreshTokenDomainAction.js';
import { type GrantBucketAccessDomainAction } from './grantBucketAccessDomainAction.js';
import { type RevokeBucketAccessDomainAction } from './revokeBucketAccessDomainAction.js';

export type UserDomainAction =
  | CreateRefreshTokenDomainAction
  | GrantBucketAccessDomainAction
  | RevokeBucketAccessDomainAction;
