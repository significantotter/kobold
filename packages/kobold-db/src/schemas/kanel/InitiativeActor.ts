import { initiativeId, type InitiativeId } from './Initiative.js';
import { initiativeActorGroupId, type InitiativeActorGroupId } from './InitiativeActorGroup.js';
import { characterId, type CharacterId } from './Character.js';
import { sheetRecordId, type SheetRecordId } from './SheetRecord.js';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';
import { gameId, GameId } from './Game.js';

export type InitiativeActorId = number;

/** Represents the table public.initiative_actor */
export default interface InitiativeActorTable {
	/** Database type: pg_catalog.int4 */
	id: ColumnType<InitiativeActorId, InitiativeActorId | undefined, InitiativeActorId>;

	/** Database type: pg_catalog.int4 */
	initiativeId: ColumnType<InitiativeId, InitiativeId, InitiativeId>;

	/** Database type: pg_catalog.int4 */
	initiativeActorGroupId: ColumnType<
		InitiativeActorGroupId,
		InitiativeActorGroupId,
		InitiativeActorGroupId
	>;

	/** Database type: pg_catalog.int4 */
	characterId: ColumnType<CharacterId | null, CharacterId | null, CharacterId | null>;

	/** Database type: pg_catalog.int4 */
	gameId: ColumnType<GameId | null, GameId | null, GameId | null>;

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
}

export const initiativeActorId = z.number().int().max(2147483647);

export const zInitiativeActor = z.object({
	id: initiativeActorId,
	initiativeId: initiativeId,
	initiativeActorGroupId: initiativeActorGroupId,
	characterId: characterId.nullable(),
	gameId: gameId.nullable(),
	userId: z.string(),
	name: z.string(),
	createdAt: z.date(),
	lastUpdatedAt: z.date(),
	referenceNpcName: z.string().nullable(),
	hideStats: z.boolean(),
	sheetRecordId: sheetRecordId,
});

export const zInitiativeActorInitializer = z.object({
	id: initiativeActorId.optional(),
	initiativeId: initiativeId,
	initiativeActorGroupId: initiativeActorGroupId,
	characterId: characterId.optional().nullable(),
	gameId: gameId.nullable(),
	userId: z.string(),
	name: z.string(),
	createdAt: z.date().optional(),
	lastUpdatedAt: z.date().optional(),
	referenceNpcName: z.string().optional().nullable(),
	hideStats: z.boolean().optional(),
	sheetRecordId: sheetRecordId,
});

export const zInitiativeActorMutator = z.object({
	id: initiativeActorId.optional(),
	initiativeId: initiativeId.optional(),
	initiativeActorGroupId: initiativeActorGroupId.optional(),
	characterId: characterId.optional().nullable(),
	gameId: gameId.nullable(),
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
