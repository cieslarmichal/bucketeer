import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M1CreateUserTableMigration implements Migration {
  public readonly name = 'M1CreateUserTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('users', (table) => {
      table.text('id');

      table.text('email').notNullable();

      table.text('password').notNullable();

      table.text('role').notNullable();

      table.primary(['id']);

      table.unique(['email']);
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('users');
  }
}
