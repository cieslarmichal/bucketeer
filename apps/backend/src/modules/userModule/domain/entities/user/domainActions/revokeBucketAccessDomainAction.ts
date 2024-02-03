import { type UserDomainActionType } from './userDomainActionType.js';

export interface RevokeBucketAccessDomainAction {
  actionName: UserDomainActionType.revokeBucketAccess;
  payload: {
    bucketName: string;
  };
}
