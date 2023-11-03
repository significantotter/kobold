import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type CharacterId = number;

/** Represents the table public.character */
export default interface CharacterTable {
  /** Database type: pg_catalog.int4 */
  id: ColumnType<CharacterId, CharacterId | null, CharacterId | null>;

  /** Database type: pg_catalog.text */
  userId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.int4 */
  charId: ColumnType<number | null, number | null, number | null>;

  /** Database type: pg_catalog.bool */
  isActiveCharacter: ColumnType<boolean | null, boolean | null, boolean | null>;

  /** Database type: pg_catalog.jsonb */
  characterData: ColumnType<unknown | null, unknown | null, unknown | null>;

  /** Database type: pg_catalog.jsonb */
  calculatedStats: ColumnType<unknown | null, unknown | null, unknown | null>;

  /** Database type: pg_catalog.timestamptz */
  createdAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.timestamptz */
  lastUpdatedAt: ColumnType<Date | null, Date | string | null, Date | string | null>;

  /** Database type: pg_catalog.jsonb */
  attributes: ColumnType<unknown, unknown | null, unknown | null>;

  /** Database type: pg_catalog.jsonb */
  customAttributes: ColumnType<unknown, unknown | null, unknown | null>;

  /** Database type: pg_catalog.jsonb */
  modifiers: ColumnType<unknown, unknown | null, unknown | null>;

  /** Database type: pg_catalog.jsonb */
  actions: ColumnType<unknown, unknown | null, unknown | null>;

  /** Database type: pg_catalog.jsonb */
  customActions: ColumnType<unknown, unknown | null, unknown | null>;

  /** Database type: pg_catalog.jsonb */
  rollMacros: ColumnType<unknown, unknown | null, unknown | null>;

  /** Database type: pg_catalog.varchar */
  importSource: ColumnType<string, string, string | null>;

  /** Database type: pg_catalog.jsonb */
  sheet: ColumnType<unknown | null, unknown | null, unknown | null>;

  /** Database type: pg_catalog.varchar */
  name: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.varchar */
  trackerMessageId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.varchar */
  trackerChannelId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.varchar */
  trackerGuildId: ColumnType<string | null, string | null, string | null>;

  /** Database type: pg_catalog.text */
  trackerMode: ColumnType<string | null, string | null, string | null>;
}

export type Character = Selectable<CharacterTable>;

export type NewCharacter = Insertable<CharacterTable>;

export type CharacterUpdate = Updateable<CharacterTable>;