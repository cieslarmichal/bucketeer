import { type SqliteDatabaseClient } from './sqliteDatabaseClient.js';
import { type SqliteDatabaseClientConfig } from './sqliteDatabaseClientConfig.js';
import { DatabaseClientFactory } from '../../../libs/database/factories/databaseClientFactory/databaseClientFactory.js';
import { DatabaseClientType } from '../../../libs/database/types/databaseClientType.js';

export class SqliteDatabaseClientFactory {
  public static create(config: SqliteDatabaseClientConfig): SqliteDatabaseClient {
    const { databasePath } = config;

    return DatabaseClientFactory.create({
      clientType: DatabaseClientType.sqlite,
      filePath: databasePath,
      useNullAsDefault: true,
      minPoolConnections: 1,
      maxPoolConnections: 1,
    });
  }
}
