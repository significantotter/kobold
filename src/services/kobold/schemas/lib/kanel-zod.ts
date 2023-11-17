import {
	zCharacter,
	zCharacterInitializer,
	zCharacterMutator,
	type Character,
} from '../kanel/Character.js';
import {
	zChannelDefaultCharacter,
	zChannelDefaultCharacterInitializer,
	zChannelDefaultCharacterMutator,
} from '../kanel/ChannelDefaultCharacter.js';
import {
	zCharactersInGames,
	zCharactersInGamesInitializer,
	zCharactersInGamesMutator,
} from '../kanel/CharactersInGames.js';
import { zGame, zGameInitializer, zGameMutator } from '../kanel/Game.js';
import {
	zGuildDefaultCharacter,
	zGuildDefaultCharacterInitializer,
	zGuildDefaultCharacterMutator,
} from '../kanel/GuildDefaultCharacter.js';
import { zInitiative, zInitiativeInitializer, zInitiativeMutator } from '../kanel/Initiative.js';
import {
	zInitiativeActor,
	zInitiativeActorInitializer,
	zInitiativeActorMutator,
} from '../kanel/InitiativeActor.js';
import {
	zInitiativeActorGroup,
	zInitiativeActorGroupInitializer,
	zInitiativeActorGroupMutator,
} from '../kanel/InitiativeActorGroup.js';
import {
	zSheetRecord,
	zSheetRecordInitializer,
	zSheetRecordMutator,
} from '../kanel/SheetRecord.js';
import {
	zUserSettings,
	zUserSettingsInitializer,
	zUserSettingsMutator,
} from '../kanel/UserSettings.js';
import {
	zWgAuthToken,
	zWgAuthTokenInitializer,
	zWgAuthTokenMutator,
} from '../kanel/WgAuthToken.js';
import { zAction, zModifier, zRollMacro, zSheet } from '../shared/index.js';
import { z } from 'zod';
import {
	CharacterWithRelations,
	GameWithRelations,
	InitiativeActorGroupWithRelations,
	InitiativeActorWithRelations,
	InitiativeWithRelations,
} from './relations-schemas.js';

const zExtendedSheetRecord = zSheetRecord.extend({
	sheet: zSheet,
	modifiers: z.array(zModifier),
	actions: z.array(zAction),
	rollMacros: z.array(zRollMacro),
});
const zExtendedSheetRecordInitializer = zSheetRecordInitializer.extend({
	sheet: zSheet,
	modifiers: z.array(zModifier),
	actions: z.array(zAction),
	rollMacros: z.array(zRollMacro),
});
const zExtendedSheetRecordMutator = zSheetRecordMutator.extend({
	sheet: zSheet.optional(),
	modifiers: z.array(zModifier).optional(),
	actions: z.array(zAction).optional(),
	rollMacros: z.array(zRollMacro).optional(),
});

// relations:
const zCharacterWithRelations = zCharacter.merge(
	z.strictObject({
		channelDefaultCharacters: zChannelDefaultCharacter.array(),
		guildDefaultCharacters: zGuildDefaultCharacter.array(),
		sheetRecord: zExtendedSheetRecord,
	})
);
const _characterCheck: Character = zCharacter._type;
const _characterWithRelationsTypeCheck: CharacterWithRelations = zCharacterWithRelations._type;

const zInitiativeActorWithRelations = zInitiativeActor.merge(
	z.strictObject({
		initiative: zInitiative.nullable().optional(),
		actorGroup: zInitiativeActorGroup,
		sheetRecord: zExtendedSheetRecord,
	})
);
const _initiativeActorWithRelationsTypeCheck: InitiativeActorWithRelations =
	zInitiativeActorWithRelations._type;

const zInitiativeActorGroupWithRelations = zInitiativeActorGroup.merge(
	z.strictObject({
		initiative: zInitiative,
		actors: zInitiativeActorWithRelations.array(),
	})
);
const _initiativeActorGroupWithRelationsTypeCheck: InitiativeActorGroupWithRelations =
	zInitiativeActorGroupWithRelations._type;

const zInitiativeWithRelations = zInitiative.merge(
	z.strictObject({
		currentTurnGroup: zInitiativeActorGroup.nullable(),
		actorGroups: zInitiativeActorGroupWithRelations.array(),
		actors: zInitiativeActorWithRelations.array(),
	})
);
const _initiativeWithRelationsTypeCheck: InitiativeWithRelations = zInitiativeWithRelations._type;

const zGameWithRelations = zGame.merge(
	z.strictObject({
		characters: zCharacterWithRelations.array(),
	})
);
const _gameWithRelationsTypeCheck: GameWithRelations = zGameWithRelations._type;

export {
	// base schemas
	zCharacter,
	zChannelDefaultCharacter,
	zCharactersInGames,
	zGame,
	zGuildDefaultCharacter,
	zInitiative,
	zInitiativeActor,
	zInitiativeActorGroup,
	zExtendedSheetRecord as zSheetRecord,
	zUserSettings,
	zWgAuthToken,
	// initializers
	zCharacterInitializer,
	zChannelDefaultCharacterInitializer,
	zCharactersInGamesInitializer,
	zGameInitializer,
	zGuildDefaultCharacterInitializer,
	zInitiativeInitializer,
	zInitiativeActorInitializer,
	zInitiativeActorGroupInitializer,
	zExtendedSheetRecordInitializer as zSheetRecordInitializer,
	zUserSettingsInitializer,
	zWgAuthTokenInitializer,
	// mutators
	zCharacterMutator,
	zChannelDefaultCharacterMutator,
	zCharactersInGamesMutator,
	zGameMutator,
	zGuildDefaultCharacterMutator,
	zInitiativeMutator,
	zInitiativeActorMutator,
	zInitiativeActorGroupMutator,
	zExtendedSheetRecordMutator as zSheetRecordMutator,
	zUserSettingsMutator,
	zWgAuthTokenMutator,
	// relation schemas
	zCharacterWithRelations,
	zInitiativeActorWithRelations,
	zInitiativeActorGroupWithRelations,
	zInitiativeWithRelations,
	zGameWithRelations,
};
