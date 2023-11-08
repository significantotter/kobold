import type { GameId } from './Game.js';
import type { CharacterId } from './Character.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

/** Represents the table public.characters_in_games */
export default interface CharactersInGamesTable {
  /** Database type: pg_catalog.int4 */
  gameId: ColumnType<GameId, GameId, GameId | null>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | null, Date | string | null>;
}

export type CharactersInGames = Selectable<CharactersInGamesTable>;

export type NewCharactersInGames = Insertable<CharactersInGamesTable>;

export type CharactersInGamesUpdate = Updateable<CharactersInGamesTable>;