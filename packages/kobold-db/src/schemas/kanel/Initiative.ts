import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type InitiativeId = number;

/** Represents the table public.initiative */
export default interface InitiativeTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<InitiativeId, InitiativeId | undefined, InitiativeId>;

  /** Database type: pg_catalog.text */
  channelId: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  gmUserId: ColumnType<string, string, string>;

  /** Database type: pg_catalog.int4 */
  currentRound: ColumnType<number, number | undefined, number>;

  /** Database type: pg_catalog.int4 */
  currentTurnGroupId: ColumnType<number | null, number | null, number | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export const initiativeId = z.number().int().max(2147483647);

export const zInitiative = z.object({
  id: initiativeId,
  channelId: z.string(),
  gmUserId: z.string(),
  currentRound: z.number().int().max(2147483647),
  currentTurnGroupId: z.number().int().max(2147483647).nullable(),
  createdAt: z.date(),
  lastUpdatedAt: z.date(),
});

export const zInitiativeInitializer = z.object({
  id: initiativeId.optional(),
  channelId: z.string(),
  gmUserId: z.string(),
  currentRound: z.number().int().max(2147483647).optional(),
  currentTurnGroupId: z.number().int().max(2147483647).optional().nullable(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
});

export const zInitiativeMutator = z.object({
  id: initiativeId.optional(),
  channelId: z.string().optional(),
  gmUserId: z.string().optional(),
  currentRound: z.number().int().max(2147483647).optional(),
  currentTurnGroupId: z.number().int().max(2147483647).optional().nullable(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
});

export type Initiative = Selectable<InitiativeTable>;

export type NewInitiative = Insertable<InitiativeTable>;

export type InitiativeUpdate = Updateable<InitiativeTable>;