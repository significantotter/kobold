import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type KnexMigrationsLockIndex = number;

/** Represents the table public.knex_migrations_lock */
export default interface KnexMigrationsLockTable {
  /** Database type: pg_catalog.int4 */
  index: ColumnType<KnexMigrationsLockIndex, KnexMigrationsLockIndex | null, KnexMigrationsLockIndex | null>;

  /** Database type: pg_catalog.int4 */
  isLocked: ColumnType<number | null, number | null, number | null>;
}

export type KnexMigrationsLock = Selectable<KnexMigrationsLockTable>;

export type NewKnexMigrationsLock = Insertable<KnexMigrationsLockTable>;

export type KnexMigrationsLockUpdate = Updateable<KnexMigrationsLockTable>;