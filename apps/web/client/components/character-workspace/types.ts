import type { api } from '@/api/api-client';

export type CharacterWorkspace = NonNullable<
	Awaited<ReturnType<typeof api.character.getCharacterWorkspace>>
>;
export type LibraryWorkspace = NonNullable<
	Awaited<ReturnType<typeof api.library.getLibraryWorkspace>>
>;

export type ActionDisplayItem =
	| CharacterWorkspace['actions']['local'][number]
	| CharacterWorkspace['actions']['inherited'][number]
	| LibraryWorkspace['sharedActions'][number];
export type RollMacroItem =
	| CharacterWorkspace['rollMacros']['local'][number]
	| LibraryWorkspace['sharedRollMacros'][number];
export type ModifierAssignedItem =
	| CharacterWorkspace['modifiers']['assignedActive'][number]
	| CharacterWorkspace['modifiers']['assignedInactive'][number];
export type ModifierLibraryItem =
	| CharacterWorkspace['modifiers']['availableFromLibrary'][number]
	| LibraryWorkspace['unassignedModifiers'][number];
export type ModifierDisplayItem = ModifierAssignedItem | ModifierLibraryItem;
export type ConditionItem = CharacterWorkspace['conditions']['items'][number];
export type ModifierPayload = ModifierDisplayItem['payload'] | ConditionItem;
export type ModifierLike = ModifierDisplayItem | ConditionItem;
export type Sheet = CharacterWorkspace['character']['sheet'];
export type SheetSummary = CharacterWorkspace['character']['summary'];
export type SheetDamageTerm = Sheet['attacks'][number]['damage'][number];
export type ActionRoll = ActionDisplayItem['payload']['rolls'][number];

export type ActiveSheetDisplay = {
	id: string;
	titleId: string;
	eyebrow: string;
	name: string;
	identityLine: string;
	summary: SheetSummary;
	sheet: Sheet;
	resourceCounts: {
		actions: number;
		modifiers: number;
		macros: number;
	};
};

export type MinionSummary = SheetSummary & {
	characterId: number | null;
	autoJoinInitiative: boolean;
};

export type MinionItem =
	| CharacterWorkspace['minions']['assigned'][number]
	| CharacterWorkspace['minions']['availableFromLibrary'][number]
	| LibraryWorkspace['unassignedMinions'][number];
