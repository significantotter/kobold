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

export type SheetRecordBase = Omit<SheetRecord, 'adjustedSheet'>;
export type SheetRecordAdjustedAsSheet = SheetRecordBase;
export type SheetRecordLite = Omit<SheetRecordBase, 'sheet'>;

/** @deprecated Use SheetRecordBase for base-sheet write/read paths. */
export type SheetRecordWithoutAdjustedSheet = SheetRecordBase;

export type CharacterWithRelations = Character & {
	channelDefaultCharacters: ChannelDefaultCharacter[];
	guildDefaultCharacters: GuildDefaultCharacter[];
	sheetRecord: SheetRecordBase;
	game?: Game | null;
	actions: Action[];
	modifiers: Modifier[];
	rollMacros: RollMacro[];
};

export type CharacterWithAdjustedSheet = Omit<CharacterWithRelations, 'sheetRecord'> & {
	sheetRecord: SheetRecordAdjustedAsSheet;
};

export type InitiativeActorWithRelations = InitiativeActor & {
	initiative?: Initiative | null;
	actorGroup: InitiativeActorGroup;
	sheetRecord: SheetRecordBase;
	game?: Game | null;
	minion?: Minion | null;
	actions: Action[];
	modifiers: Modifier[];
	rollMacros: RollMacro[];
};

export type InitiativeActorWithAdjustedSheet = Omit<InitiativeActorWithRelations, 'sheetRecord'> & {
	sheetRecord: SheetRecordAdjustedAsSheet;
};

export type MinionWithRelations = Minion & {
	sheetRecord: SheetRecordBase;
	actions: Action[];
	modifiers: Modifier[];
	rollMacros: RollMacro[];
};

export type MinionWithAdjustedSheet = Omit<MinionWithRelations, 'sheetRecord'> & {
	sheetRecord: SheetRecordAdjustedAsSheet;
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

export type InitiativeActorGroupWithAdjustedSheet = Omit<
	InitiativeActorGroupWithRelations,
	'actors'
> & {
	actors: InitiativeActorWithAdjustedSheet[];
};

export type InitiativeWithRelations = Initiative & {
	currentTurnGroup: InitiativeActorGroup | null;
	actorGroups: InitiativeActorGroupWithRelations[];
	actors: InitiativeActorWithRelations[];
};

export type InitiativeWithAdjustedSheets = Omit<
	InitiativeWithRelations,
	'actorGroups' | 'actors'
> & {
	actorGroups: InitiativeActorGroupWithAdjustedSheet[];
	actors: InitiativeActorWithAdjustedSheet[];
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
		imageUrl: string | null;
		hpCurrent: number | null;
		hpMax: number | null;
		ac: number | null;
		perception: number | null;
		fortitude: number | null;
		reflex: number | null;
		will: number | null;
		speed: number | null;
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

export const zSheetRecordBase = zSheetRecord.omit({
	adjustedSheet: true,
});
export const zSheetRecordAdjustedAsSheet = zSheetRecordBase;
export const zSheetRecordLite = zSheetRecordBase.omit({ sheet: true });

/** @deprecated Use zSheetRecordBase for base-sheet write/read paths. */
export const zSheetRecordWithoutAdjustedSheet = zSheetRecordBase;

export const zCharacterWithRelations = zCharacter.extend({
	channelDefaultCharacters: z.array(zChannelDefaultCharacter),
	guildDefaultCharacters: z.array(zGuildDefaultCharacter),
	sheetRecord: zSheetRecordBase,
	game: zGame.nullable().optional(),
	actions: z.array(zAction),
	modifiers: z.array(zModifier),
	rollMacros: z.array(zRollMacro),
});

export const zCharacterWithAdjustedSheet = zCharacterWithRelations.extend({
	sheetRecord: zSheetRecordAdjustedAsSheet,
});

export const zInitiativeActorWithRelations: z.ZodType<InitiativeActorWithRelations> = z.lazy(() =>
	zInitiativeActor.extend({
		initiative: zInitiative.nullable().optional(),
		actorGroup: zInitiativeActorGroup,
		sheetRecord: zSheetRecordBase,
		game: zGame.nullable().optional(),
		minion: zMinion.nullable().optional(),
		actions: z.array(zAction),
		modifiers: z.array(zModifier),
		rollMacros: z.array(zRollMacro),
	})
);

export const zInitiativeActorWithAdjustedSheet: z.ZodType<InitiativeActorWithAdjustedSheet> =
	z.lazy(() =>
		zInitiativeActor.extend({
			initiative: zInitiative.nullable().optional(),
			actorGroup: zInitiativeActorGroup,
			sheetRecord: zSheetRecordAdjustedAsSheet,
			game: zGame.nullable().optional(),
			minion: zMinion.nullable().optional(),
			actions: z.array(zAction),
			modifiers: z.array(zModifier),
			rollMacros: z.array(zRollMacro),
		})
	);

export const zMinionWithRelations = zMinion.extend({
	sheetRecord: zSheetRecordBase,
	actions: z.array(zAction),
	modifiers: z.array(zModifier),
	rollMacros: z.array(zRollMacro),
});

export const zMinionWithAdjustedSheet = zMinionWithRelations.extend({
	sheetRecord: zSheetRecordAdjustedAsSheet,
});

export const zInitiativeActorGroupWithRelations: z.ZodType<InitiativeActorGroupWithRelations> =
	z.lazy(() =>
		zInitiativeActorGroup.extend({
			initiative: zInitiative.nullable().optional(),
			actors: z.array(zInitiativeActorWithRelations),
		})
	);

export const zInitiativeActorGroupWithAdjustedSheet: z.ZodType<InitiativeActorGroupWithAdjustedSheet> =
	z.lazy(() =>
		zInitiativeActorGroup.extend({
			initiative: zInitiative.nullable().optional(),
			actors: z.array(zInitiativeActorWithAdjustedSheet),
		})
	);

export const zInitiativeWithRelations: z.ZodType<InitiativeWithRelations> = z.lazy(() =>
	zInitiative.extend({
		currentTurnGroup: zInitiativeActorGroup.nullable(),
		actorGroups: z.array(zInitiativeActorGroupWithRelations),
		actors: z.array(zInitiativeActorWithRelations),
	})
);

export const zInitiativeWithAdjustedSheets: z.ZodType<InitiativeWithAdjustedSheets> = z.lazy(() =>
	zInitiative.extend({
		currentTurnGroup: zInitiativeActorGroup.nullable(),
		actorGroups: z.array(zInitiativeActorGroupWithAdjustedSheet),
		actors: z.array(zInitiativeActorWithAdjustedSheet),
	})
);

export const zGameWithRelations: z.ZodType<GameWithRelations> = z.lazy(() =>
	zGame.extend({
		characters: z.array(zCharacterWithRelations),
	})
);
