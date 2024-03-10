import { gameId, type GameId } from './Game.js';
import { characterId, type CharacterId } from './Character.js';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type CharactersInGamesCreatedAt = Date;

export type CharactersInGamesLastUpdatedAt = Date;

/** Represents the table public.characters_in_games */
export default interface CharactersInGamesTable {
  /** Database type: pg_catalog.int4 */
  gameId: ColumnType<GameId, GameId, GameId>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<CharactersInGamesCreatedAt, CharactersInGamesCreatedAt | undefined, CharactersInGamesCreatedAt>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<CharactersInGamesLastUpdatedAt, CharactersInGamesLastUpdatedAt | undefined, CharactersInGamesLastUpdatedAt>;
}

export const charactersInGamesCreatedAt = z.date();

export const charactersInGamesLastUpdatedAt = z.date();

export const zCharactersInGames = z.object({
  gameId: gameId,
  characterId: characterId,
  createdAt: charactersInGamesCreatedAt,
  lastUpdatedAt: charactersInGamesLastUpdatedAt,
});

export const zCharactersInGamesInitializer = z.object({
  gameId: gameId,
  characterId: characterId,
  createdAt: charactersInGamesCreatedAt.optional(),
  lastUpdatedAt: charactersInGamesLastUpdatedAt.optional(),
});

export const zCharactersInGamesMutator = z.object({
  gameId: gameId.optional(),
  characterId: characterId.optional(),
  createdAt: charactersInGamesCreatedAt.optional(),
  lastUpdatedAt: charactersInGamesLastUpdatedAt.optional(),
});

export type CharactersInGames = Selectable<CharactersInGamesTable>;

export type NewCharactersInGames = Insertable<CharactersInGamesTable>;

export type CharactersInGamesUpdate = Updateable<CharactersInGamesTable>;