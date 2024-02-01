import { type UserRawEntity } from './userRawEntity.js';
import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class UserTable implements DatabaseTable<UserRawEntity> {
  public readonly name = 'users';
  public readonly columns = {
    id: 'id',
    email: 'email',
    password: 'password',
    role: 'role',
  } as const;
}
