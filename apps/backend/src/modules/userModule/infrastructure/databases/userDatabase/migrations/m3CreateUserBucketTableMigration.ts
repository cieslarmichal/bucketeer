import { type DatabaseClient } from '../../../../../../libs/database/clients/databaseClient/databaseClient.js';
import { type Migration } from '../../../../../../libs/database/types/migration.js';

export class M3CreateUserBucketTableMigration implements Migration {
  public readonly name = 'M3CreateUserBucketTableMigration';

  public async up(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.createTable('userBuckets', (table) => {
      table.text('id');

      table.text('userId').notNullable();

      table.text('bucketName').notNullable();

      table.primary(['id']);

      table.unique(['userId', 'bucketName']);

      table.foreign('userId').references('id').inTable('users').onDelete('CASCADE');
    });
  }

  public async down(databaseClient: DatabaseClient): Promise<void> {
    await databaseClient.schema.dropTable('userBuckets');
  }
}
