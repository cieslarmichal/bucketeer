import { type UserDomainActionType } from './userDomainActionType.js';

export interface GrantBucketAccessDomainAction {
  actionName: UserDomainActionType.grantBucketAccess;
  payload: {
    bucketName: string;
  };
}
