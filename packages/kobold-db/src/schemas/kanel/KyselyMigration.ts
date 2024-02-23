import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type KyselyMigrationName = string;

/** Represents the table public.kysely_migration */
export default interface KyselyMigrationTable {
  /** Database type: pg_catalog.varchar */
  name: ColumnType<KyselyMigrationName, KyselyMigrationName, KyselyMigrationName>;

  /** Database type: pg_catalog.varchar */
  timestamp: ColumnType<string, string, string>;
}

export const kyselyMigrationName = z.string();

export const zKyselyMigration = z.object({
  name: kyselyMigrationName,
  timestamp: z.string(),
});

export const zKyselyMigrationInitializer = z.object({
  name: kyselyMigrationName,
  timestamp: z.string(),
});

export const zKyselyMigrationMutator = z.object({
  name: kyselyMigrationName.optional(),
  timestamp: z.string().optional(),
});

export type KyselyMigration = Selectable<KyselyMigrationTable>;

export type NewKyselyMigration = Insertable<KyselyMigrationTable>;

export type KyselyMigrationUpdate = Updateable<KyselyMigrationTable>;