import type { InitiativeId } from './Initiative.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

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
  initiativeResult: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;
}

export type InitiativeActorGroup = Selectable<InitiativeActorGroupTable>;

export type NewInitiativeActorGroup = Insertable<InitiativeActorGroupTable>;

export type InitiativeActorGroupUpdate = Updateable<InitiativeActorGroupTable>;