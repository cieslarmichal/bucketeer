import { type DatabaseClient } from '../clients/databaseClient/databaseClient.js';

export interface Migration {
  readonly name: string;
  up(databaseClient: DatabaseClient): Promise<void>;
  down(databaseClient: DatabaseClient): Promise<void>;
}
