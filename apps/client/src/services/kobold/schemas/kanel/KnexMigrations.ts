import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';
import { z } from 'zod';

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

export const knexMigrationsId = z.number().int().max(2147483647);

export const zKnexMigrations = z.strictObject({
  id: knexMigrationsId,
  name: z.string().nullable(),
  batch: z.number().int().max(2147483647).nullable(),
  migrationTime: z.date().nullable(),
});

export const zKnexMigrationsInitializer = z.strictObject({
  id: knexMigrationsId.optional(),
  name: z.string().optional().nullable(),
  batch: z.number().int().max(2147483647).optional().nullable(),
  migrationTime: z.date().optional().nullable(),
});

export const zKnexMigrationsMutator = z.strictObject({
  id: knexMigrationsId.optional(),
  name: z.string().optional().nullable(),
  batch: z.number().int().max(2147483647).optional().nullable(),
  migrationTime: z.date().optional().nullable(),
});

export type KnexMigrations = Selectable<KnexMigrationsTable>;

export type NewKnexMigrations = Insertable<KnexMigrationsTable>;

export type KnexMigrationsUpdate = Updateable<KnexMigrationsTable>;