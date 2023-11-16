import { sheetRecordId } from './SheetRecord.js';
import type { SheetRecordId } from './SheetRecord.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';
import { z } from 'zod';

export type CharacterId = number;

/** Represents the table public.character */
export default interface CharacterTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<CharacterId, CharacterId | null, CharacterId | null>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.int4 */
  charId: ColumnType<number, number, number | null>;

  /** Database type: pg_catalog.bool */
  isActiveCharacter: ColumnType<boolean, boolean | null, boolean | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.varchar */
  name: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.text */
  importSource: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.int4 */
  sheetRecordId: ColumnType<SheetRecordId, SheetRecordId, SheetRecordId | null>;
}

export const characterId = z.number();

export const zCharacter = z.strictObject({
  id: characterId,
  userId: z.string(),
  charId: z.number(),
  isActiveCharacter: z.boolean(),
  createdAt: z.date(),
  lastUpdatedAt: z.date(),
  name: z.string(),
  importSource: z.string(),
  sheetRecordId: sheetRecordId,
});

export const zCharacterInitializer = z.strictObject({
  id: characterId.optional(),
  userId: z.string(),
  charId: z.number(),
  isActiveCharacter: z.boolean().optional(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
  name: z.string(),
  importSource: z.string(),
  sheetRecordId: sheetRecordId,
});

export const zCharacterMutator = z.strictObject({
  id: characterId.optional(),
  userId: z.string().optional(),
  charId: z.number().optional(),
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