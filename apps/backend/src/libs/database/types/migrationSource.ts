import { type Migration } from './migration.js';

export interface MigrationSource {
  getMigrations(): Promise<Migration[]>;
  getMigrationName(migration: Migration): string;
  getMigration(migration: Migration): Promise<Migration>;
  getMigrationTableName(): string;
}
