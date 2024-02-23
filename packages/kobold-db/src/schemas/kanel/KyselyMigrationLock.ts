import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type KyselyMigrationLockId = string;

/** Represents the table public.kysely_migration_lock */
export default interface KyselyMigrationLockTable {
  /** Database type: pg_catalog.varchar */
  id: ColumnType<KyselyMigrationLockId, KyselyMigrationLockId, KyselyMigrationLockId>;

  /** Database type: pg_catalog.int4 */
  isLocked: ColumnType<number, number | undefined, number>;
}

export const kyselyMigrationLockId = z.string();

export const zKyselyMigrationLock = z.object({
  id: kyselyMigrationLockId,
  isLocked: z.number().int().max(2147483647),
});

export const zKyselyMigrationLockInitializer = z.object({
  id: kyselyMigrationLockId,
  isLocked: z.number().int().max(2147483647).optional(),
});

export const zKyselyMigrationLockMutator = z.object({
  id: kyselyMigrationLockId.optional(),
  isLocked: z.number().int().max(2147483647).optional(),
});

export type KyselyMigrationLock = Selectable<KyselyMigrationLockTable>;

export type NewKyselyMigrationLock = Insertable<KyselyMigrationLockTable>;

export type KyselyMigrationLockUpdate = Updateable<KyselyMigrationLockTable>;