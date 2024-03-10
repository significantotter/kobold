import { sheetRecordId, type SheetRecordId } from './SheetRecord.js';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type CharacterId = number;

/** Represents the table public.character */
export default interface CharacterTable {
	/** Database type: pg_catalog.int4 */
	id: ColumnType<CharacterId, CharacterId | undefined, CharacterId>;

	/** Database type: pg_catalog.text */
	userId: ColumnType<string, string, string>;

	/** Database type: pg_catalog.int4 */
	charId: ColumnType<number, number, number>;

	/** Database type: pg_catalog.bool */
	isActiveCharacter: ColumnType<boolean, boolean | undefined, boolean>;

	/** Database type: pg_catalog.timestamptz */
	createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

	/** Database type: pg_catalog.timestamptz */
	lastUpdatedAt: ColumnType<Date, Date | string | undefined, Date | string>;

	/** Database type: pg_catalog.varchar */
	name: ColumnType<string, string, string>;

	/** Database type: pg_catalog.text */
	importSource: ColumnType<string, string, string>;

	/** Database type: pg_catalog.int4 */
	sheetRecordId: ColumnType<SheetRecordId, SheetRecordId, SheetRecordId>;
}

export const characterId = z.number().int().max(2147483647);

export const zCharacter = z.object({
	id: characterId,
	userId: z.string(),
	charId: z.number().int().max(2147483647),
	isActiveCharacter: z.boolean(),
	createdAt: z.date(),
	lastUpdatedAt: z.date(),
	name: z.string(),
	importSource: z.string(),
	sheetRecordId: sheetRecordId,
});

export const zCharacterInitializer = z.object({
	id: characterId.optional(),
	userId: z.string(),
	charId: z.number().int().max(2147483647),
	isActiveCharacter: z.boolean().optional(),
	createdAt: z.date().optional(),
	lastUpdatedAt: z.date().optional(),
	name: z.string(),
	importSource: z.string(),
	sheetRecordId: sheetRecordId,
});

export const zCharacterMutator = z.object({
	id: characterId.optional(),
	userId: z.string().optional(),
	charId: z.number().int().max(2147483647).optional(),
	isActiveCharacter: z.boolean().optional(),
	createdAt: z.date().optional(),
	lastUpdatedAt: z.date().optional(),
	name: z.string().optional(),
	importSource: z.string().optional(),
	sheetRecordId: sheetRecordId.optional(),
});

export type Character = Selectable<CharacterTable>;

export type NewCharacter = Insertable<CharacterTable>;

export type CharacterUpdate = Updateable<CharacterTable>;
