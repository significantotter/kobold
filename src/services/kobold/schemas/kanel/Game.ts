import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type GameId = number;

/** Represents the table public.game */
export default interface GameTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<GameId, GameId | null, GameId | null>;

  /** Database type: pg_catalog.text */
  gmUserId: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.text */
  guildId: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.bool */
  isActive: ColumnType<boolean, boolean | null, boolean | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | null, Date | string | null>;
}

export type Game = Selectable<GameTable>;

export type NewGame = Insertable<GameTable>;

export type GameUpdate = Updateable<GameTable>;