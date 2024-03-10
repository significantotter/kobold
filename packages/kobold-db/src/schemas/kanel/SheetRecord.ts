import { type Sheet, type Modifiers, type Actions, type RollMacros, type SheetRecordTrackerModeEnum } from './../kanel-types.js';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type SheetRecordId = number;

/** Represents the table public.sheet_record */
export default interface SheetRecordTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<SheetRecordId, SheetRecordId | undefined, SheetRecordId>;

  /** Database type: pg_catalog.jsonb */
  sheet: ColumnType<Sheet, Sheet, Sheet>;

  /** Database type: pg_catalog.jsonb */
  modifiers: ColumnType<Modifiers, Modifiers | undefined, Modifiers>;

  /** Database type: pg_catalog.jsonb */
  actions: ColumnType<Actions, Actions | undefined, Actions>;

  /** Database type: pg_catalog.jsonb */
  rollMacros: ColumnType<RollMacros, RollMacros | undefined, RollMacros>;

  /** Database type: pg_catalog.text */
  trackerMode: ColumnType<SheetRecordTrackerModeEnum | null, SheetRecordTrackerModeEnum | null, SheetRecordTrackerModeEnum | null>;

  /** Database type: pg_catalog.text */
  trackerMessageId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  trackerChannelId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  trackerGuildId: ColumnType<string | null, string | null, string | null>;
}

export const sheetRecordId = z.number().int().max(2147483647);

export const zSheetRecord = z.object({
  id: sheetRecordId,
  sheet: z.unknown(),
  modifiers: z.unknown(),
  actions: z.unknown(),
  rollMacros: z.unknown(),
  trackerMode: z.string().nullable(),
  trackerMessageId: z.string().nullable(),
  trackerChannelId: z.string().nullable(),
  trackerGuildId: z.string().nullable(),
});

export const zSheetRecordInitializer = z.object({
  id: sheetRecordId.optional(),
  sheet: z.unknown(),
  modifiers: z.unknown().optional(),
  actions: z.unknown().optional(),
  rollMacros: z.unknown().optional(),
  trackerMode: z.string().optional().nullable(),
  trackerMessageId: z.string().optional().nullable(),
  trackerChannelId: z.string().optional().nullable(),
  trackerGuildId: z.string().optional().nullable(),
});

export const zSheetRecordMutator = z.object({
  id: sheetRecordId.optional(),
  sheet: z.unknown().optional(),
  modifiers: z.unknown().optional(),
  actions: z.unknown().optional(),
  rollMacros: z.unknown().optional(),
  trackerMode: z.string().optional().nullable(),
  trackerMessageId: z.string().optional().nullable(),
  trackerChannelId: z.string().optional().nullable(),
  trackerGuildId: z.string().optional().nullable(),
});

export type SheetRecord = Selectable<SheetRecordTable>;

export type NewSheetRecord = Insertable<SheetRecordTable>;

export type SheetRecordUpdate = Updateable<SheetRecordTable>;