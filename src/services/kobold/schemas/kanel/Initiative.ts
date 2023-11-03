import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type InitiativeId = number;

/** Represents the table public.initiative */
export default interface InitiativeTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<InitiativeId, InitiativeId | null, InitiativeId | null>;

  /** Database type: pg_catalog.text */
  channelId: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.text */
  gmUserId: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.jsonb */
  roundMessageIds: ColumnType<unknown | null, unknown | null, unknown | null>;

  /** Database type: pg_catalog.int4 */
  currentRound: ColumnType<number, number | null, number | null>;

  /** Database type: pg_catalog.int4 */
  currentTurnGroupId: ColumnType<number | null, number | null, number | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type Initiative = Selectable<InitiativeTable>;

export type NewInitiative = Insertable<InitiativeTable>;

export type InitiativeUpdate = Updateable<InitiativeTable>;