import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type KyselyMigrationLockId = string;

/** Represents the table public.kysely_migration_lock */
export default interface KyselyMigrationLockTable {
  /** Database type: pg_catalog.varchar */
  id: ColumnType<KyselyMigrationLockId, KyselyMigrationLockId, KyselyMigrationLockId | null>;

  /** Database type: pg_catalog.int4 */
  isLocked: ColumnType<number, number | null, number | null>;
}

export type KyselyMigrationLock = Selectable<KyselyMigrationLockTable>;

export type NewKyselyMigrationLock = Insertable<KyselyMigrationLockTable>;

export type KyselyMigrationLockUpdate = Updateable<KyselyMigrationLockTable>;