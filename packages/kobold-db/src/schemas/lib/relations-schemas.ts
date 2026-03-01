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
