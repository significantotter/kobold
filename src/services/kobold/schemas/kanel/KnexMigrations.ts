import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type KnexMigrationsId = number;

/** Represents the table public.knex_migrations */
export default interface KnexMigrationsTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<KnexMigrationsId, KnexMigrationsId | null, KnexMigrationsId | null>;

  /** Database type: pg_catalog.varchar */
  name: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.int4 */
  batch: ColumnType<number | null, number | null, number | null>;

  /** Database type: pg_catalog.timestamptz */
  migrationTime: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type KnexMigrations = Selectable<KnexMigrationsTable>;

export type NewKnexMigrations = Insertable<KnexMigrationsTable>;

export type KnexMigrationsUpdate = Updateable<KnexMigrationsTable>;