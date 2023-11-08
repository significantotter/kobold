import type { NpcData, NpcFluff } from './../kanel-types.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type NpcId = number;

/** Represents the table public.npc */
export default interface NpcTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<NpcId, NpcId | null, NpcId | null>;

  /** Database type: pg_catalog.jsonb */
  data: ColumnType<NpcData, NpcData | null, NpcData | null>;

  /** Database type: pg_catalog.jsonb */
  fluff: ColumnType<NpcFluff, NpcFluff | null, NpcFluff | null>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.text */
  sourceFileName: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | null, Date | string | null>;
}

export type Npc = Selectable<NpcTable>;

export type NewNpc = Insertable<NpcTable>;

export type NpcUpdate = Updateable<NpcTable>;