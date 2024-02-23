import { characterId, type CharacterId } from './Character.js';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type GuildDefaultCharacterUserId = string;

export type GuildDefaultCharacterGuildId = string;

/** Represents the table public.guild_default_character */
export default interface GuildDefaultCharacterTable {
  /** Database type: pg_catalog.text */
  userId: ColumnType<GuildDefaultCharacterUserId, GuildDefaultCharacterUserId, GuildDefaultCharacterUserId>;

  /** Database type: pg_catalog.text */
  guildId: ColumnType<GuildDefaultCharacterGuildId, GuildDefaultCharacterGuildId, GuildDefaultCharacterGuildId>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId>;
}

export const guildDefaultCharacterUserId = z.string();

export const guildDefaultCharacterGuildId = z.string();

export const zGuildDefaultCharacter = z.object({
  userId: guildDefaultCharacterUserId,
  guildId: guildDefaultCharacterGuildId,
  characterId: characterId,
});

export const zGuildDefaultCharacterInitializer = z.object({
  userId: guildDefaultCharacterUserId,
  guildId: guildDefaultCharacterGuildId,
  characterId: characterId,
});

export const zGuildDefaultCharacterMutator = z.object({
  userId: guildDefaultCharacterUserId.optional(),
  guildId: guildDefaultCharacterGuildId.optional(),
  characterId: characterId.optional(),
});

export type GuildDefaultCharacter = Selectable<GuildDefaultCharacterTable>;

export type NewGuildDefaultCharacter = Insertable<GuildDefaultCharacterTable>;

export type GuildDefaultCharacterUpdate = Updateable<GuildDefaultCharacterTable>;