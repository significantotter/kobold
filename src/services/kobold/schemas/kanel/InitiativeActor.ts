import type { InitiativeId } from './Initiative.js';
import type { InitiativeActorGroupId } from './InitiativeActorGroup.js';
import type { CharacterId } from './Character.js';
import type { SheetRecordId } from './SheetRecord.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type InitiativeActorId = number;

/** Represents the table public.initiative_actor */
export default interface InitiativeActorTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<InitiativeActorId, InitiativeActorId | null, InitiativeActorId | null>;

  /** Database type: pg_catalog.int4 */
  initiativeId: ColumnType<InitiativeId, InitiativeId, InitiativeId | null>;

  /** Database type: pg_catalog.int4 */
  initiativeActorGroupId: ColumnType<InitiativeActorGroupId, InitiativeActorGroupId, InitiativeActorGroupId | null>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId | null, CharacterId | null, CharacterId | null>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.text */
  referenceNpcName: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.bool */
  hideStats: ColumnType<boolean, boolean | null, boolean | null>;

  /** Database type: pg_catalog.int4 */
  sheetRecordId: ColumnType<SheetRecordId, SheetRecordId, SheetRecordId | null>;
}

export type InitiativeActor = Selectable<InitiativeActorTable>;

export type NewInitiativeActor = Insertable<InitiativeActorTable>;

export type InitiativeActorUpdate = Updateable<InitiativeActorTable>;