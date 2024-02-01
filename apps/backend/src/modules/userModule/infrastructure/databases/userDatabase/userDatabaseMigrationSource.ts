import { M1CreateUserTableMigration } from './migrations/m1CreateUserTableMigration.js';
import { M2CreateBlacklistTokenTableMigration } from './migrations/m2CreateBlacklistTokenTableMigration.js';
import { M3CreateRefreshTokenTableMigration } from './migrations/m3CreateRefreshTokenTableMigration.js';
import { M4CreateUserDirectoryTableMigration } from './migrations/m4CreateUserDirectoryTableMigration.js';
import { type Migration } from '../../../../../libs/database/types/migration.js';
import { type MigrationSource } from '../../../../../libs/database/types/migrationSource.js';

export class UserDatabaseMigrationSource implements MigrationSource {
  public async getMigrations(): Promise<Migration[]> {
    return [
      new M1CreateUserTableMigration(),
      new M2CreateBlacklistTokenTableMigration(),
      new M3CreateRefreshTokenTableMigration(),
      new M4CreateUserDirectoryTableMigration(),
    ];
  }

  public getMigrationName(migration: Migration): string {
    return migration.name;
  }

  public async getMigration(migration: Migration): Promise<Migration> {
    return migration;
  }

  public getMigrationTableName(): string {
    return 'userDatabaseMigrations';
  }
}
