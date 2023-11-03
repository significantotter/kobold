import type { CharacterId } from './Character.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type GuildDefaultCharacterUserId = string;

export type GuildDefaultCharacterGuildId = string;

/** Represents the table public.guild_default_character */
export default interface GuildDefaultCharacterTable {
  /** Database type: pg_catalog.varchar */
  userId: ColumnType<GuildDefaultCharacterUserId, GuildDefaultCharacterUserId, GuildDefaultCharacterUserId | null>;

  /** Database type: pg_catalog.varchar */
  guildId: ColumnType<GuildDefaultCharacterGuildId, GuildDefaultCharacterGuildId, GuildDefaultCharacterGuildId | null>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId | null>;
}

export type GuildDefaultCharacter = Selectable<GuildDefaultCharacterTable>;

export type NewGuildDefaultCharacter = Insertable<GuildDefaultCharacterTable>;

export type GuildDefaultCharacterUpdate = Updateable<GuildDefaultCharacterTable>;