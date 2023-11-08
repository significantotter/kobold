import { z } from 'zod';
import {
	ChannelDefaultCharacter,
	Character,
	Game,
	GuildDefaultCharacter,
	Initiative,
	InitiativeActor,
	InitiativeActorGroup,
} from '../db-types.js';

export type CharacterWithRelations = Character & {
	channelDefaultCharacters: ChannelDefaultCharacter[];
	guildDefaultCharacters: GuildDefaultCharacter[];
};

export type InitiativeActorWithRelations = InitiativeActor & {
	initiative?: Initiative | null;
	actorGroup: InitiativeActorGroup;
	character?: CharacterWithRelations | null;
};

export type InitiativeActorGroupWithRelations = InitiativeActorGroup & {
	initiative?: Initiative | null;
	actors: InitiativeActorWithRelations[];
};

export type InitiativeWithRelations = Initiative & {
	currentTurnGroup: InitiativeActorGroup | null;
	actorGroups: InitiativeActorGroupWithRelations[];
	actors: InitiativeActorWithRelations[];
};

export type GameWithRelations = Game & {
	characters: CharacterWithRelations[];
};
