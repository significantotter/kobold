import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';
import { z } from 'zod';

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

export const gameId = z.number().int().max(2147483647);

export const zGame = z.strictObject({
  id: gameId,
  gmUserId: z.string(),
  name: z.string(),
  guildId: z.string(),
  isActive: z.boolean(),
  createdAt: z.date(),
  lastUpdatedAt: z.date(),
});

export const zGameInitializer = z.strictObject({
  id: gameId.optional(),
  gmUserId: z.string(),
  name: z.string(),
  guildId: z.string(),
  isActive: z.boolean().optional(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
});

export const zGameMutator = z.strictObject({
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