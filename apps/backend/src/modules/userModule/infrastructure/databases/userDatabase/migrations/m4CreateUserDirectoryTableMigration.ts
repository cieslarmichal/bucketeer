import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M4CreateUserDirectoryTableMigration implements Migration {
  public readonly name = 'M4CreateUserDirectoryTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('userDirectories', (table) => {
      table.text('id');

      table.text('userId').notNullable();

      table.text('directoryName').notNullable();

      table.primary(['id']);

      table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('userDirectories');
  }
}
