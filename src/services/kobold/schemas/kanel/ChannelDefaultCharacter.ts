import { characterId } from './Character.js';
import type { CharacterId } from './Character.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';
import { z } from 'zod';

export type ChannelDefaultCharacterUserId = string;

export type ChannelDefaultCharacterChannelId = string;

/** Represents the table public.channel_default_character */
export default interface ChannelDefaultCharacterTable {
  /** Database type: pg_catalog.varchar */
  userId: ColumnType<ChannelDefaultCharacterUserId, ChannelDefaultCharacterUserId, ChannelDefaultCharacterUserId | null>;

  /** Database type: pg_catalog.text */
  channelId: ColumnType<ChannelDefaultCharacterChannelId, ChannelDefaultCharacterChannelId, ChannelDefaultCharacterChannelId | null>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId | null>;
}

export const channelDefaultCharacterUserId = z.string();

export const channelDefaultCharacterChannelId = z.string();

export const zChannelDefaultCharacter = z.strictObject({
  userId: channelDefaultCharacterUserId,
  channelId: channelDefaultCharacterChannelId,
  characterId: characterId,
});

export const zChannelDefaultCharacterInitializer = z.strictObject({
  userId: channelDefaultCharacterUserId,
  channelId: channelDefaultCharacterChannelId,
  characterId: characterId,
});

export const zChannelDefaultCharacterMutator = z.strictObject({
  userId: channelDefaultCharacterUserId.optional(),
  channelId: channelDefaultCharacterChannelId.optional(),
  characterId: characterId.optional(),
});

export type ChannelDefaultCharacter = Selectable<ChannelDefaultCharacterTable>;

export type NewChannelDefaultCharacter = Insertable<ChannelDefaultCharacterTable>;

export type ChannelDefaultCharacterUpdate = Updateable<ChannelDefaultCharacterTable>;