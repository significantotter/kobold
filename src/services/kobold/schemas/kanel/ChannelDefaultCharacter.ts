import type { CharacterId } from './Character.js';
import type { ColumnType, Selectable, Insertable, Updateable } from 'kysely';

export type ChannelDefaultCharacterUserId = string;

export type ChannelDefaultCharacterChannelId = string;

/** Represents the table public.channel_default_character */
export default interface channeldefaultcharacterTable {
  /** Database type: pg_catalog.varchar */
  userId: ColumnType<ChannelDefaultCharacterUserId, ChannelDefaultCharacterUserId, ChannelDefaultCharacterUserId | null>;

  /** Database type: pg_catalog.varchar */
  channelId: ColumnType<ChannelDefaultCharacterChannelId, ChannelDefaultCharacterChannelId, ChannelDefaultCharacterChannelId | null>;

  /** Database type: pg_catalog.int4 */
  characterId: ColumnType<CharacterId, CharacterId, CharacterId | null>;
}

export type channeldefaultcharacter = Selectable<channeldefaultcharacterTable>;

export type Newchanneldefaultcharacter = Insertable<channeldefaultcharacterTable>;

export type channeldefaultcharacterUpdate = Updateable<channeldefaultcharacterTable>;