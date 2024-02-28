import { type DatabaseTable } from '../../../../../../../common/types/databaseTable.js';

export class UserTable implements DatabaseTable {
  public readonly name = 'users';
}
