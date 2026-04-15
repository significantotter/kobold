import type { Insertable, Selectable, Updateable } from 'kysely';
import type { Database } from './supabase.kysely.types.js';

// Action
type ActionTable = Database['action'];
export type Action = Selectable<ActionTable>;
export type NewAction = Insertable<ActionTable>;
export type ActionUpdate = Updateable<ActionTable>;
export type ActionId = Action['id'];

// Character
type CharacterTable = Database['character'];
export type Character = Selectable<CharacterTable>;
export type NewCharacter = Insertable<CharacterTable>;
export type CharacterUpdate = Updateable<CharacterTable>;
export type CharacterId = Character['id'];

/** Lightweight character type for autocomplete and listing — no sheet/relations loaded */
export type CharacterBasic = Pick<
	Character,
	'id' | 'name' | 'userId' | 'sheetRecordId' | 'isActiveCharacter' | 'importSource' | 'charId'
>;

// ChannelDefaultCharacter
type ChannelDefaultCharacterTable = Database['channelDefaultCharacter'];
export type ChannelDefaultCharacter = Selectable<ChannelDefaultCharacterTable>;
export type NewChannelDefaultCharacter = Insertable<ChannelDefaultCharacterTable>;
export type ChannelDefaultCharacterUpdate = Updateable<ChannelDefaultCharacterTable>;
export type ChannelDefaultCharacterUserId = ChannelDefaultCharacter['userId'];

// Game
type GameTable = Database['game'];
export type Game = Selectable<GameTable>;
export type NewGame = Insertable<GameTable>;
export type GameUpdate = Updateable<GameTable>;
export type GameId = Game['id'];

// GuildDefaultCharacter
type GuildDefaultCharacterTable = Database['guildDefaultCharacter'];
export type GuildDefaultCharacter = Selectable<GuildDefaultCharacterTable>;
export type NewGuildDefaultCharacter = Insertable<GuildDefaultCharacterTable>;
export type GuildDefaultCharacterUpdate = Updateable<GuildDefaultCharacterTable>;
export type GuildDefaultCharacterUserId = GuildDefaultCharacter['userId'];

// Initiative
type InitiativeTable = Database['initiative'];
export type Initiative = Selectable<InitiativeTable>;
export type NewInitiative = Insertable<InitiativeTable>;
export type InitiativeUpdate = Updateable<InitiativeTable>;
export type InitiativeId = Initiative['id'];

// InitiativeActor
type InitiativeActorTable = Database['initiativeActor'];
export type InitiativeActor = Selectable<InitiativeActorTable>;
export type NewInitiativeActor = Insertable<InitiativeActorTable>;
export type InitiativeActorUpdate = Updateable<InitiativeActorTable>;
export type InitiativeActorId = InitiativeActor['id'];

// InitiativeActorGroup
type InitiativeActorGroupTable = Database['initiativeActorGroup'];
export type InitiativeActorGroup = Selectable<InitiativeActorGroupTable>;
export type NewInitiativeActorGroup = Insertable<InitiativeActorGroupTable>;
export type InitiativeActorGroupUpdate = Updateable<InitiativeActorGroupTable>;
export type InitiativeActorGroupId = InitiativeActorGroup['id'];

// Minion
type MinionTable = Database['minion'];
export type Minion = Selectable<MinionTable>;
export type NewMinion = Insertable<MinionTable>;
export type MinionUpdate = Updateable<MinionTable>;
export type MinionId = Minion['id'];

// Modifier
type ModifierTable = Database['modifier'];
export type Modifier = Selectable<ModifierTable>;
export type NewModifier = Insertable<ModifierTable>;
export type ModifierUpdate = Updateable<ModifierTable>;
export type ModifierId = Modifier['id'];

// RollMacro
type RollMacroTable = Database['rollMacro'];
export type RollMacro = Selectable<RollMacroTable>;
export type NewRollMacro = Insertable<RollMacroTable>;
export type RollMacroUpdate = Updateable<RollMacroTable>;
export type RollMacroId = RollMacro['id'];

// SheetRecord
type SheetRecordTable = Database['sheetRecord'];
export type SheetRecord = Selectable<SheetRecordTable>;
export type NewSheetRecord = Insertable<SheetRecordTable>;
export type SheetRecordUpdate = Updateable<SheetRecordTable>;
export type SheetRecordId = SheetRecord['id'];

// UserSettings
type UserSettingsTable = Database['userSettings'];
export type UserSettings = Selectable<UserSettingsTable>;
export type NewUserSettings = Insertable<UserSettingsTable>;
export type UserSettingsUpdate = Updateable<UserSettingsTable>;
export type UserSettingsUserId = UserSettings['userId'];

// WgAuthToken
type WgAuthTokenTable = Database['wgAuthToken'];
export type WgAuthToken = Selectable<WgAuthTokenTable>;
export type NewWgAuthToken = Insertable<WgAuthTokenTable>;
export type WgAuthTokenUpdate = Updateable<WgAuthTokenTable>;
export type WgAuthTokenId = WgAuthToken['id'];
