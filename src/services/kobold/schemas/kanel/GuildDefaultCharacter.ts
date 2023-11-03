import type { CharacterId } from './Character.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type GuildDefaultCharacterUserId = string;

export type GuildDefaultCharacterGuildId = string;

/** Represents the table public.guild_default_character */
export default interface guilddefaultcharacterTable {
  /** Database type: pg_catalog.varchar */
  userId: ColumnType<GuildDefaultCharacterUserId, GuildDefaultCharacterUserId, GuildDefaultCharacterUserId | null>;

  /** Database type: pg_catalog.varchar */
  guildId: ColumnType<GuildDefaultCharacterGuildId, GuildDefaultCharacterGuildId, GuildDefaultCharacterGuildId | null>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId | null>;
}

export type guilddefaultcharacter = Selectable<guilddefaultcharacterTable>;

export type Newguilddefaultcharacter = Insertable<guilddefaultcharacterTable>;

export type guilddefaultcharacterUpdate = Updateable<guilddefaultcharacterTable>;