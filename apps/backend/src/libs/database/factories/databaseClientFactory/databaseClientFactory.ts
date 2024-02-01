import knex from 'knex';

import { type DatabaseClient } from '../../clients/databaseClient/databaseClient.js';
import { type DatabaseClientConfig } from '../../clients/databaseClient/databaseClientConfig.js';
import { DatabaseClientType } from '../../types/databaseClientType.js';

export class DatabaseClientFactory {
  public static create(config: DatabaseClientConfig): DatabaseClient {
    if (config.clientType === DatabaseClientType.postgres) {
      const {
        clientType,
        host,
        port,
        user,
        password,
        databaseName,
        minPoolConnections,
        maxPoolConnections,
        isAsyncStackTracesEnabled,
        useNullAsDefault,
      } = config;

      return knex({
        client: clientType,
        connection: {
          host,
          port,
          user,
          password,
          database: databaseName,
        },
        pool: {
          min: minPoolConnections,
          max: maxPoolConnections,
        },
        asyncStackTraces: isAsyncStackTracesEnabled ?? false,
        useNullAsDefault: useNullAsDefault ?? false,
      });
    } else {
      const {
        clientType,
        filePath,
        minPoolConnections,
        maxPoolConnections,
        isAsyncStackTracesEnabled,
        useNullAsDefault,
      } = config;

      return knex({
        client: clientType,
        connection: {
          filename: filePath,
        },
        pool: {
          min: minPoolConnections,
          max: maxPoolConnections,
        },
        asyncStackTraces: isAsyncStackTracesEnabled ?? false,
        useNullAsDefault: useNullAsDefault ?? false,
      });
    }
  }
}
