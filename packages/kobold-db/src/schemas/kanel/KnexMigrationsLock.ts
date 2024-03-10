import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type KnexMigrationsLockIndex = number;

/** Represents the table public.knex_migrations_lock */
export default interface KnexMigrationsLockTable {
  /** Database type: pg_catalog.int4 */
  index: ColumnType<KnexMigrationsLockIndex, KnexMigrationsLockIndex | undefined, KnexMigrationsLockIndex>;

  /** Database type: pg_catalog.int4 */
  isLocked: ColumnType<number | null, number | null, number | null>;
}

export const knexMigrationsLockIndex = z.number().int().max(2147483647);

export const zKnexMigrationsLock = z.object({
  index: knexMigrationsLockIndex,
  isLocked: z.number().int().max(2147483647).nullable(),
});

export const zKnexMigrationsLockInitializer = z.object({
  index: knexMigrationsLockIndex.optional(),
  isLocked: z.number().int().max(2147483647).optional().nullable(),
});

export const zKnexMigrationsLockMutator = z.object({
  index: knexMigrationsLockIndex.optional(),
  isLocked: z.number().int().max(2147483647).optional().nullable(),
});

export type KnexMigrationsLock = Selectable<KnexMigrationsLockTable>;

export type NewKnexMigrationsLock = Insertable<KnexMigrationsLockTable>;

export type KnexMigrationsLockUpdate = Updateable<KnexMigrationsLockTable>;