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
	minion?: Minion | null;
	actions: Action[];
	modifiers: Modifier[];
	rollMacros: RollMacro[];
};

export type MinionWithRelations = Minion & {
	sheetRecord: SheetRecord;
	actions: Action[];
	modifiers: Modifier[];
	rollMacros: RollMacro[];
};

/**
 * Lightweight minion type — just the base table columns, no sheet relations.
 * Use for autocomplete, name lookups, and existence checks.
 */
export type MinionBasic = Minion;

export type InitiativeActorGroupWithRelations = InitiativeActorGroup & {
	initiative?: Initiative | null;
	actors: InitiativeActorWithRelations[];
};

export type InitiativeWithRelations = Initiative & {
	currentTurnGroup: InitiativeActorGroup | null;
	actorGroups: InitiativeActorGroupWithRelations[];
	actors: InitiativeActorWithRelations[];
};

export type GameCharacterLite = Pick<
	Character,
	| 'id'
	| 'name'
	| 'userId'
	| 'sheetRecordId'
	| 'isActiveCharacter'
	| 'charId'
	| 'importSource'
	| 'gameId'
> & {
	channelDefaultCharacters: ChannelDefaultCharacter[];
	guildDefaultCharacters: GuildDefaultCharacter[];
};

/** Lightweight character summary for the /character list command. */
export type CharacterListItem = Pick<
	Character,
	'id' | 'name' | 'userId' | 'sheetRecordId' | 'isActiveCharacter' | 'importSource' | 'charId'
> & {
	channelDefaultCharacters: ChannelDefaultCharacter[];
	guildDefaultCharacters: GuildDefaultCharacter[];
	sheetInfo: {
		level: number | null;
		heritage: string | null;
		ancestry: string | null;
		class: string | null;
	};
};

export type GameWithCharactersLite = Game & {
	characters: GameCharacterLite[];
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
		minion: zMinion.nullable().optional(),
		actions: z.array(zAction),
		modifiers: z.array(zModifier),
		rollMacros: z.array(zRollMacro),
	})
);

export const zMinionWithRelations = zMinion.extend({
	sheetRecord: zSheetRecord,
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
