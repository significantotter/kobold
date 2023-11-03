import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type NpcId = number;

/** Represents the table public.npc */
export default interface npcTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<NpcId, NpcId | null, NpcId | null>;

  /** Database type: pg_catalog.jsonb */
  data: ColumnType<unknown | null, unknown | null, unknown | null>;

  /** Database type: pg_catalog.jsonb */
  fluff: ColumnType<unknown | null, unknown | null, unknown | null>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  sourceFileName: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type npc = Selectable<npcTable>;

export type Newnpc = Insertable<npcTable>;

export type npcUpdate = Updateable<npcTable>;