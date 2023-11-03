import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type GameId = number;

/** Represents the table public.game */
export default interface gameTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<GameId, GameId | null, GameId | null>;

  /** Database type: pg_catalog.text */
  gmUserId: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  guildId: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.bool */
  isActive: ColumnType<boolean, boolean | null, boolean | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type game = Selectable<gameTable>;

export type Newgame = Insertable<gameTable>;

export type gameUpdate = Updateable<gameTable>;