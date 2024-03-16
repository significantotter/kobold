import { initiativeId, type InitiativeId } from './Initiative.js';
import { initiativeActorGroupId, type InitiativeActorGroupId } from './InitiativeActorGroup.js';
import { characterId, type CharacterId } from './Character.js';
import { sheetRecordId, type SheetRecordId } from './SheetRecord.js';
import { gameId, type GameId } from './Game.js';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type InitiativeActorId = number;

/** Represents the table public.initiative_actor */
export default interface InitiativeActorTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<InitiativeActorId, InitiativeActorId | undefined, InitiativeActorId>;

  /** Database type: pg_catalog.int4 */
  initiativeId: ColumnType<InitiativeId, InitiativeId, InitiativeId>;

  /** Database type: pg_catalog.int4 */
  initiativeActorGroupId: ColumnType<InitiativeActorGroupId, InitiativeActorGroupId, InitiativeActorGroupId>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId | null, CharacterId | null, CharacterId | null>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.text */
  referenceNpcName: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.bool */
  hideStats: ColumnType<boolean, boolean | undefined, boolean>;

  /** Database type: pg_catalog.int4 */
  sheetRecordId: ColumnType<SheetRecordId, SheetRecordId, SheetRecordId>;

  /** Database type: pg_catalog.int4 */
  gameId: ColumnType<GameId | null, GameId | null, GameId | null>;

  /** Database type: pg_catalog.text */
  note: ColumnType<string | null, string | null, string | null>;
}

export const initiativeActorId = z.number().int().max(2147483647);

export const zInitiativeActor = z.object({
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
  gameId: gameId.nullable(),
  note: z.string().nullable(),
});

export const zInitiativeActorInitializer = z.object({
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
  gameId: gameId.optional().nullable(),
  note: z.string().optional().nullable(),
});

export const zInitiativeActorMutator = z.object({
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
  gameId: gameId.optional().nullable(),
  note: z.string().optional().nullable(),
});

export type InitiativeActor = Selectable<InitiativeActorTable>;

export type NewInitiativeActor = Insertable<InitiativeActorTable>;

export type InitiativeActorUpdate = Updateable<InitiativeActorTable>;