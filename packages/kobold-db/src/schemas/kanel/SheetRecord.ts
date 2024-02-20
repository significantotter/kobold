import type {
  Sheet,
  Modifiers,
  Actions,
  RollMacros,
  SheetRecordTrackerModeEnum,
} from "../kanel-types.js";
import type { ColumnType, Selectable, Insertable, Updateable } from "kysely";
import { z } from "zod";

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
  trackerMode: ColumnType<
    SheetRecordTrackerModeEnum | null,
    SheetRecordTrackerModeEnum | null,
    SheetRecordTrackerModeEnum | null
  >;

  /** Database type: pg_catalog.text */
  trackerMessageId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  trackerChannelId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  trackerGuildId: ColumnType<string | null, string | null, string | null>;
}

export const sheetRecordId = z.number().int().max(2147483647);

export const zSheetRecord = z.strictObject({
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

export const zSheetRecordInitializer = z.strictObject({
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

export const zSheetRecordMutator = z.strictObject({
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
