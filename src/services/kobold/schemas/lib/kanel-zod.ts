import { zCharacter, type Character } from '../kanel/Character.js';
import { zChannelDefaultCharacter } from '../kanel/ChannelDefaultCharacter.js';
import { zCharactersInGames } from '../kanel/CharactersInGames.js';
import { zGame } from '../kanel/Game.js';
import { zGuildDefaultCharacter } from '../kanel/GuildDefaultCharacter.js';
import { zInitiative } from '../kanel/Initiative.js';
import { zInitiativeActor } from '../kanel/InitiativeActor.js';
import { zInitiativeActorGroup } from '../kanel/InitiativeActorGroup.js';
import { zSheetRecord } from '../kanel/SheetRecord.js';
import { zUserSettings } from '../kanel/UserSettings.js';
import { zWgAuthToken } from '../kanel/WgAuthToken.js';
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
	// relation schemas
	zCharacterWithRelations,
	zInitiativeActorWithRelations,
	zInitiativeActorGroupWithRelations,
	zInitiativeWithRelations,
	zGameWithRelations,
};
