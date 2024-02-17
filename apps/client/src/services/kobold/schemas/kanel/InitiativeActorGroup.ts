import { initiativeId } from './Initiative.js';
import type { InitiativeId } from './Initiative.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';
import { z } from 'zod';

export type InitiativeActorGroupId = number;

/** Represents the table public.initiative_actor_group */
export default interface InitiativeActorGroupTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<InitiativeActorGroupId, InitiativeActorGroupId | null, InitiativeActorGroupId | null>;

  /** Database type: pg_catalog.int4 */
  initiativeId: ColumnType<InitiativeId, InitiativeId, InitiativeId | null>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.numeric */
  initiativeResult: ColumnType<number, number, number | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | null, Date | string | null>;
}

export const initiativeActorGroupId = z.number().int().max(2147483647);

export const zInitiativeActorGroup = z.strictObject({
  id: initiativeActorGroupId,
  initiativeId: initiativeId,
  userId: z.string(),
  name: z.string(),
  initiativeResult: z.number(),
  createdAt: z.date(),
  lastUpdatedAt: z.date(),
});

export const zInitiativeActorGroupInitializer = z.strictObject({
  id: initiativeActorGroupId.optional(),
  initiativeId: initiativeId,
  userId: z.string(),
  name: z.string(),
  initiativeResult: z.number(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
});

export const zInitiativeActorGroupMutator = z.strictObject({
  id: initiativeActorGroupId.optional(),
  initiativeId: initiativeId.optional(),
  userId: z.string().optional(),
  name: z.string().optional(),
  initiativeResult: z.number().optional(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
});

export type InitiativeActorGroup = Selectable<InitiativeActorGroupTable>;

export type NewInitiativeActorGroup = Insertable<InitiativeActorGroupTable>;

export type InitiativeActorGroupUpdate = Updateable<InitiativeActorGroupTable>;