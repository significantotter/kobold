import { initiativeId, type InitiativeId } from './Initiative.js';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type InitiativeActorGroupId = number;

/** Represents the table public.initiative_actor_group */
export default interface InitiativeActorGroupTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<InitiativeActorGroupId, InitiativeActorGroupId | undefined, InitiativeActorGroupId>;

  /** Database type: pg_catalog.int4 */
  initiativeId: ColumnType<InitiativeId, InitiativeId, InitiativeId>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<string, string, string>;

  /** Database type: pg_catalog.text */
  name: ColumnType<string, string, string>;

  /** Database type: pg_catalog.numeric */
  initiativeResult: ColumnType<number, number, number>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date, Date | string | undefined, Date | string>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date, Date | string | undefined, Date | string>;
}

export const initiativeActorGroupId = z.number().int().max(2147483647);

export const zInitiativeActorGroup = z.object({
  id: initiativeActorGroupId,
  initiativeId: initiativeId,
  userId: z.string(),
  name: z.string(),
  initiativeResult: z.number(),
  createdAt: z.date(),
  lastUpdatedAt: z.date(),
});

export const zInitiativeActorGroupInitializer = z.object({
  id: initiativeActorGroupId.optional(),
  initiativeId: initiativeId,
  userId: z.string(),
  name: z.string(),
  initiativeResult: z.number(),
  createdAt: z.date().optional(),
  lastUpdatedAt: z.date().optional(),
});

export const zInitiativeActorGroupMutator = z.object({
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