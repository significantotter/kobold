import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type GameId = number;

/** Represents the table public.game */
export default interface GameTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<GameId, GameId | undefined, GameId>;

  /** Database type: pg_catalog.text */
  gmUserId: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  guildId: ColumnType<string, string, string>;

  /** Database type: pg_catalog.bool */
  isActive: ColumnType<boolean, boolean | undefined, boolean>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export const gameId = z.number().int().max(2147483647);

export const zGame = z.object({
  id: gameId,
  gmUserId: z.string(),
  name: z.string(),
  guildId: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  lastUpdatedAt: z.date(),
});

export const zGameInitializer = z.object({
  id: gameId.optional(),
  gmUserId: z.string(),
  name: z.string(),
  guildId: z.string(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
});

export const zGameMutator = z.object({
  id: gameId.optional(),
  gmUserId: z.string().optional(),
  name: z.string().optional(),
  guildId: z.string().optional(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
});

export type Game = Selectable<GameTable>;

export type NewGame = Insertable<GameTable>;

export type GameUpdate = Updateable<GameTable>;