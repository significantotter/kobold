import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';
import { z } from 'zod';

export type KnexMigrationsLockIndex = number;

/** Represents the table public.knex_migrations_lock */
export default interface KnexMigrationsLockTable {
  /** Database type: pg_catalog.int4 */
  index: ColumnType<KnexMigrationsLockIndex, KnexMigrationsLockIndex | null, KnexMigrationsLockIndex | null>;

  /** Database type: pg_catalog.int4 */
  isLocked: ColumnType<number | null, number | null, number | null>;
}

export const knexMigrationsLockIndex = z.number();

export const zKnexMigrationsLock = z.strictObject({
  index: knexMigrationsLockIndex,
  isLocked: z.number().nullable(),
});

export const zKnexMigrationsLockInitializer = z.strictObject({
  index: knexMigrationsLockIndex.optional(),
  isLocked: z.number().optional().nullable(),
});

export const zKnexMigrationsLockMutator = z.strictObject({
  index: knexMigrationsLockIndex.optional(),
  isLocked: z.number().optional().nullable(),
});

export type KnexMigrationsLock = Selectable<KnexMigrationsLockTable>;

export type NewKnexMigrationsLock = Insertable<KnexMigrationsLockTable>;

export type KnexMigrationsLockUpdate = Updateable<KnexMigrationsLockTable>;