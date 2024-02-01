import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M2CreateBlacklistTokenTableMigration implements Migration {
  public name = 'M2CreateBlacklistTokenTableMigration';

  private readonly tableName = 'blacklistTokens';

  private readonly columns = {
    id: 'id',
    token: 'token',
    expiresAt: 'expiresAt',
  } as const;

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text(this.columns.id).notNullable();

      table.text(this.columns.token).notNullable();

      table.timestamp(this.columns.expiresAt).notNullable();

      table.primary([this.columns.id]);

      table.unique([this.columns.token]);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
