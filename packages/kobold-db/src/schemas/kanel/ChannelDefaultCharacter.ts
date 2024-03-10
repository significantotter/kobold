import { characterId, type CharacterId } from './Character.js';
import { type ColumnType, type Selectable, type Insertable, type Updateable } from 'kysely';
import { z } from 'zod';

export type ChannelDefaultCharacterUserId = string;

export type ChannelDefaultCharacterChannelId = string;

/** Represents the table public.channel_default_character */
export default interface ChannelDefaultCharacterTable {
  /** Database type: pg_catalog.text */
  userId: ColumnType<ChannelDefaultCharacterUserId, ChannelDefaultCharacterUserId, ChannelDefaultCharacterUserId>;

  /** Database type: pg_catalog.text */
  channelId: ColumnType<ChannelDefaultCharacterChannelId, ChannelDefaultCharacterChannelId, ChannelDefaultCharacterChannelId>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId>;
}

export const channelDefaultCharacterUserId = z.string();

export const channelDefaultCharacterChannelId = z.string();

export const zChannelDefaultCharacter = z.object({
  userId: channelDefaultCharacterUserId,
  channelId: channelDefaultCharacterChannelId,
  characterId: characterId,
});

export const zChannelDefaultCharacterInitializer = z.object({
  userId: channelDefaultCharacterUserId,
  channelId: channelDefaultCharacterChannelId,
  characterId: characterId,
});

export const zChannelDefaultCharacterMutator = z.object({
  userId: channelDefaultCharacterUserId.optional(),
  channelId: channelDefaultCharacterChannelId.optional(),
  characterId: characterId.optional(),
});

export type ChannelDefaultCharacter = Selectable<ChannelDefaultCharacterTable>;

export type NewChannelDefaultCharacter = Insertable<ChannelDefaultCharacterTable>;

export type ChannelDefaultCharacterUpdate = Updateable<ChannelDefaultCharacterTable>;