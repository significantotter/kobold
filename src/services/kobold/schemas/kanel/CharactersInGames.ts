import { gameId } from './Game.js';
import type { GameId } from './Game.js';
import { characterId } from './Character.js';
import type { CharacterId } from './Character.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';
import { z } from 'zod';

export type CharactersInGamesCreatedAt = Date;

export type CharactersInGamesLastUpdatedAt = Date;

/** Represents the table public.characters_in_games */
export default interface CharactersInGamesTable {
  /** Database type: pg_catalog.int4 */
  gameId: ColumnType<GameId, GameId, GameId | null>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<CharactersInGamesCreatedAt, CharactersInGamesCreatedAt | null, CharactersInGamesCreatedAt | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<CharactersInGamesLastUpdatedAt, CharactersInGamesLastUpdatedAt | null, CharactersInGamesLastUpdatedAt | null>;
}

export const charactersInGamesCreatedAt = z.date();

export const charactersInGamesLastUpdatedAt = z.date();

export const zCharactersInGames = z.strictObject({
  gameId: gameId,
  characterId: characterId,
  createdAt: charactersInGamesCreatedAt,
  lastUpdatedAt: charactersInGamesLastUpdatedAt,
});

export const zCharactersInGamesInitializer = z.strictObject({
  gameId: gameId,
  characterId: characterId,
  createdAt: charactersInGamesCreatedAt.optional(),
  lastUpdatedAt: charactersInGamesLastUpdatedAt.optional(),
});

export const zCharactersInGamesMutator = z.strictObject({
  gameId: gameId.optional(),
  characterId: characterId.optional(),
  createdAt: charactersInGamesCreatedAt.optional(),
  lastUpdatedAt: charactersInGamesLastUpdatedAt.optional(),
});

export type CharactersInGames = Selectable<CharactersInGamesTable>;

export type NewCharactersInGames = Insertable<CharactersInGamesTable>;

export type CharactersInGamesUpdate = Updateable<CharactersInGamesTable>;