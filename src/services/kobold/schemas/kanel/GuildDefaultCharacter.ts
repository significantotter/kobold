import { characterId } from './Character.js';
import type { CharacterId } from './Character.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';
import { z } from 'zod';

export type GuildDefaultCharacterUserId = string;

export type GuildDefaultCharacterGuildId = string;

/** Represents the table public.guild_default_character */
export default interface GuildDefaultCharacterTable {
  /** Database type: pg_catalog.text */
  userId: ColumnType<GuildDefaultCharacterUserId, GuildDefaultCharacterUserId, GuildDefaultCharacterUserId | null>;

  /** Database type: pg_catalog.text */
  guildId: ColumnType<GuildDefaultCharacterGuildId, GuildDefaultCharacterGuildId, GuildDefaultCharacterGuildId | null>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId | null>;
}

export const guildDefaultCharacterUserId = z.string();

export const guildDefaultCharacterGuildId = z.string();

export const zGuildDefaultCharacter = z.strictObject({
  userId: guildDefaultCharacterUserId,
  guildId: guildDefaultCharacterGuildId,
  characterId: characterId,
});

export const zGuildDefaultCharacterInitializer = z.strictObject({
  userId: guildDefaultCharacterUserId,
  guildId: guildDefaultCharacterGuildId,
  characterId: characterId,
});

export const zGuildDefaultCharacterMutator = z.strictObject({
  userId: guildDefaultCharacterUserId.optional(),
  guildId: guildDefaultCharacterGuildId.optional(),
  characterId: characterId.optional(),
});

export type GuildDefaultCharacter = Selectable<GuildDefaultCharacterTable>;

export type NewGuildDefaultCharacter = Insertable<GuildDefaultCharacterTable>;

export type GuildDefaultCharacterUpdate = Updateable<GuildDefaultCharacterTable>;