import type { SheetRecordId } from './SheetRecord.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

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

export type Character = Selectable<CharacterTable>;

export type NewCharacter = Insertable<CharacterTable>;

export type CharacterUpdate = Updateable<CharacterTable>;