import { type UserDirectoryRawEntity } from './userDirectoryRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class UserDirectoryTable implements DatabaseTable<UserDirectoryRawEntity> {
  public readonly name = 'userDirectories';
  public readonly columns = {
    id: 'id',
    userId: 'userId',
    directoryName: 'directoryName',
  } as const;
}
