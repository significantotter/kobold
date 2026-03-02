import { z } from 'zod';
import {
	Action,
	ChannelDefaultCharacter,
	Character,
	Game,
	GuildDefaultCharacter,
	Initiative,
	InitiativeActor,
	InitiativeActorGroup,
	Minion,
	Modifier,
	RollMacro,
	SheetRecord,
} from '../db-types.js';

import {
	zAction,
	zModifier,
	zCharacter,
	zChannelDefaultCharacter,
	zGuildDefaultCharacter,
	zSheetRecord,
	zGame,
	zInitiative,
	zInitiativeActor,
	zInitiativeActorGroup,
	zMinion,
	zRollMacro,
} from '../supabase.zod.js';

// ============================================================================
// TypeScript Types for Relations
// ============================================================================

export type CharacterWithRelations = Character & {
	channelDefaultCharacters: ChannelDefaultCharacter[];
	guildDefaultCharacters: GuildDefaultCharacter[];
	sheetRecord: SheetRecord;
	game?: Game | null;
	actions: Action[];
	modifiers: Modifier[];
	rollMacros: RollMacro[];
};

export type InitiativeActorWithRelations = InitiativeActor & {
	initiative?: Initiative | null;
	actorGroup: InitiativeActorGroup;
	sheetRecord: SheetRecord;
	game?: Game | null;
	actions: Action[];
	modifiers: Modifier[];
	rollMacros: RollMacro[];
};

export type MinionWithRelations = Minion & {
	sheetRecord?: SheetRecord | null;
	actions: Action[];
	modifiers: Modifier[];
	rollMacros: RollMacro[];
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

// ============================================================================
// Zod Schemas for Relations (for test data generation with zod-schema-faker)
// ============================================================================

export const zCharacterWithRelations = zCharacter.extend({
	channelDefaultCharacters: z.array(zChannelDefaultCharacter),
	guildDefaultCharacters: z.array(zGuildDefaultCharacter),
	sheetRecord: zSheetRecord,
	game: zGame.nullable().optional(),
	actions: z.array(zAction),
	modifiers: z.array(zModifier),
	rollMacros: z.array(zRollMacro),
});

export const zInitiativeActorWithRelations: z.ZodType<InitiativeActorWithRelations> = z.lazy(() =>
	zInitiativeActor.extend({
		initiative: zInitiative.nullable().optional(),
		actorGroup: zInitiativeActorGroup,
		sheetRecord: zSheetRecord,
		game: zGame.nullable().optional(),
		actions: z.array(zAction),
		modifiers: z.array(zModifier),
		rollMacros: z.array(zRollMacro),
	})
);

export const zMinionWithRelations = zMinion.extend({
	sheetRecord: zSheetRecord.nullable().optional(),
	actions: z.array(zAction),
	modifiers: z.array(zModifier),
	rollMacros: z.array(zRollMacro),
});

export const zInitiativeActorGroupWithRelations: z.ZodType<InitiativeActorGroupWithRelations> =
	z.lazy(() =>
		zInitiativeActorGroup.extend({
			initiative: zInitiative.nullable().optional(),
			actors: z.array(zInitiativeActorWithRelations),
		})
	);

export const zInitiativeWithRelations: z.ZodType<InitiativeWithRelations> = z.lazy(() =>
	zInitiative.extend({
		currentTurnGroup: zInitiativeActorGroup.nullable(),
		actorGroups: z.array(zInitiativeActorGroupWithRelations),
		actors: z.array(zInitiativeActorWithRelations),
	})
);

export const zGameWithRelations: z.ZodType<GameWithRelations> = z.lazy(() =>
	zGame.extend({
		characters: z.array(zCharacterWithRelations),
	})
);
