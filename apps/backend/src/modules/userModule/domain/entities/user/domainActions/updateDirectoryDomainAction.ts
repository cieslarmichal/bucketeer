import { type UserDomainActionType } from './userDomainActionType.js';

export interface UpdateDirectoryDomainAction {
  actionName: UserDomainActionType.updateDirectory;
  payload: {
    directoryName: string;
  };
}
