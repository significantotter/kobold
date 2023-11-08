import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type KyselyMigrationName = string;

/** Represents the table public.kysely_migration */
export default interface KyselyMigrationTable {
  /** Database type: pg_catalog.varchar */
  name: ColumnType<KyselyMigrationName, KyselyMigrationName, KyselyMigrationName | null>;

  /** Database type: pg_catalog.varchar */
  timestamp: ColumnType<string, string, string | null>;
}

export type KyselyMigration = Selectable<KyselyMigrationTable>;

export type NewKyselyMigration = Insertable<KyselyMigrationTable>;

export type KyselyMigrationUpdate = Updateable<KyselyMigrationTable>;