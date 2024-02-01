import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M3CreateRefreshTokenTableMigration implements Migration {
  public name = 'M3CreateRefreshTokenTableMigration';

  private readonly tableName = 'refreshTokens';

  private readonly columns = {
    id: 'id',
    userId: 'userId',
    token: 'token',
    expiresAt: 'expiresAt',
  } as const;

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable(this.tableName, (table) => {
      table.text(this.columns.id).notNullable();

      table.text(this.columns.userId).notNullable();

      table.text(this.columns.token).notNullable();

      table.timestamp(this.columns.expiresAt).notNullable();

      table.primary([this.columns.id]);

      table.unique([this.columns.token]);

      table.foreign(this.columns.userId).references('id').inTable('users').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable(this.tableName);
  }
}
