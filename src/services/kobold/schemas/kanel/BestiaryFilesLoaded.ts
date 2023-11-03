import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type BestiaryFilesLoadedId = number;

/** Represents the table public.bestiary_files_loaded */
export default interface BestiaryFilesLoadedTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<BestiaryFilesLoadedId, BestiaryFilesLoadedId | null, BestiaryFilesLoadedId | null>;

  /** Database type: pg_catalog.text */
  fileName: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  fileHash: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type BestiaryFilesLoaded = Selectable<BestiaryFilesLoadedTable>;

export type NewBestiaryFilesLoaded = Insertable<BestiaryFilesLoadedTable>;

export type BestiaryFilesLoadedUpdate = Updateable<BestiaryFilesLoadedTable>;