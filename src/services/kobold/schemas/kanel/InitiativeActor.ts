import { initiativeId } from './Initiative.js';
import type { InitiativeId } from './Initiative.js';
import { initiativeActorGroupId } from './InitiativeActorGroup.js';
import type { InitiativeActorGroupId } from './InitiativeActorGroup.js';
import { characterId } from './Character.js';
import type { CharacterId } from './Character.js';
import { sheetRecordId } from './SheetRecord.js';
import type { SheetRecordId } from './SheetRecord.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';
import { z } from 'zod';

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

export const initiativeActorId = z.number();

export const zInitiativeActor = z.strictObject({
  id: initiativeActorId,
  initiativeId: initiativeId,
  initiativeActorGroupId: initiativeActorGroupId,
  characterId: characterId.nullable(),
  userId: z.string(),
  name: z.string(),
  createdAt: z.date(),
  lastUpdatedAt: z.date(),
  referenceNpcName: z.string().nullable(),
  hideStats: z.boolean(),
  sheetRecordId: sheetRecordId,
});

export const zInitiativeActorInitializer = z.strictObject({
  id: initiativeActorId.optional(),
  initiativeId: initiativeId,
  initiativeActorGroupId: initiativeActorGroupId,
  characterId: characterId.optional().nullable(),
  userId: z.string(),
  name: z.string(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
  referenceNpcName: z.string().optional().nullable(),
  hideStats: z.boolean().optional(),
  sheetRecordId: sheetRecordId,
});

export const zInitiativeActorMutator = z.strictObject({
  id: initiativeActorId.optional(),
  initiativeId: initiativeId.optional(),
  initiativeActorGroupId: initiativeActorGroupId.optional(),
  characterId: characterId.optional().nullable(),
  userId: z.string().optional(),
  name: z.string().optional(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
  referenceNpcName: z.string().optional().nullable(),
  hideStats: z.boolean().optional(),
  sheetRecordId: sheetRecordId.optional(),
});

export type InitiativeActor = Selectable<InitiativeActorTable>;

export type NewInitiativeActor = Insertable<InitiativeActorTable>;

export type InitiativeActorUpdate = Updateable<InitiativeActorTable>;