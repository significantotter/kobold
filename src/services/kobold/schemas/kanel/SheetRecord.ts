import type { Sheet, Modifiers, Actions, RollMacros } from './../kanel-types.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type SheetRecordId = number;

/** Represents the table public.sheet_record */
export default interface SheetRecordTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<SheetRecordId, SheetRecordId | null, SheetRecordId | null>;

  /** Database type: pg_catalog.jsonb */
  sheet: ColumnType<Sheet, Sheet, Sheet | null>;

  /** Database type: pg_catalog.jsonb */
  modifiers: ColumnType<Modifiers, Modifiers | null, Modifiers | null>;

  /** Database type: pg_catalog.jsonb */
  actions: ColumnType<Actions, Actions | null, Actions | null>;

  /** Database type: pg_catalog.jsonb */
  rollMacros: ColumnType<RollMacros, RollMacros | null, RollMacros | null>;

  /** Database type: pg_catalog.text */
  trackerMode: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  trackerMessageId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  trackerChannelId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  trackerGuildId: ColumnType<string | null, string | null, string | null>;
}

export type SheetRecord = Selectable<SheetRecordTable>;

export type NewSheetRecord = Insertable<SheetRecordTable>;

export type SheetRecordUpdate = Updateable<SheetRecordTable>;