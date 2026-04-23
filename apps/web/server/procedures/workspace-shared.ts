import {
	zAction,
	zCondition,
	zImportSourceEnum,
	zMinionWithRelations,
	zModifier,
	zRollMacro,
	type Action,
	type Condition,
	type MinionWithRelations,
	type Modifier,
	type RollMacro,
} from '@kobold/db';
import { z } from 'zod';

export const zWorkspaceScope = z.enum(['library', 'character', 'minion']);
export const zWorkspaceAssignment = z.enum([
	'none',
	'local',
	'inherited-all',
	'assigned-character',
	'assigned-minion',
]);

export const zResourceCapabilities = z.object({
	canEdit: z.boolean(),
	canDelete: z.boolean(),
	canAssign: z.boolean(),
	canUnassign: z.boolean(),
	canMoveToLibrary: z.boolean(),
	canCopy: z.boolean(),
	canToggleActive: z.boolean(),
	canUpdateSeverity: z.boolean(),
});

export const zResourceMeta = z.object({
	id: z.number(),
	name: z.string(),
	scope: zWorkspaceScope,
	assignment: zWorkspaceAssignment,
	source: z.string().nullable(),
	capabilities: zResourceCapabilities,
});

export type WorkspaceScope = z.infer<typeof zWorkspaceScope>;
export type WorkspaceAssignment = z.infer<typeof zWorkspaceAssignment>;
export type ResourceCapabilities = z.infer<typeof zResourceCapabilities>;
export type ResourceMeta = z.infer<typeof zResourceMeta>;
export type ImportSource = z.infer<typeof zImportSourceEnum>;

export type ActionWorkspaceItem = {
	meta: ResourceMeta;
	payload: Action;
};

export type RollMacroWorkspaceItem = {
	meta: ResourceMeta;
	payload: RollMacro;
};

export type ModifierWorkspaceItem = {
	meta: ResourceMeta;
	payload: Modifier;
};

export type MinionWorkspaceSummary = {
	level: number | null;
	ancestry: string | null;
	class: string | null;
	characterId: number | null;
	autoJoinInitiative: boolean;
};

export type MinionWorkspaceItem = {
	meta: ResourceMeta;
	summary: MinionWorkspaceSummary;
	payload: MinionWithRelations;
};

export type CharacterSheetSummary = {
	level: number | null;
	heritage: string | null;
	ancestry: string | null;
	class: string | null;
	imageUrl: string | null;
};

export type CharacterManagementListItem = {
	id: number;
	name: string;
	importSource: ImportSource;
	charId: number;
	isActiveCharacter: boolean;
	summary: Omit<CharacterSheetSummary, 'imageUrl'>;
	counts: {
		modifiers: number;
		visibleActions: number;
		visibleRollMacros: number;
		assignedMinions: number;
	};
};

export type CharacterWorkspace = {
	character: {
		id: number;
		name: string;
		importSource: ImportSource;
		charId: number;
		isActiveCharacter: boolean;
		sheetRecordId: number;
		summary: CharacterSheetSummary;
	};
	overview: {
		source: ImportSource;
		counts: {
			localActions: number;
			inheritedActions: number;
			assignedActiveModifiers: number;
			assignedInactiveModifiers: number;
			availableLibraryModifiers: number;
			localRollMacros: number;
			inheritedRollMacros: number;
			assignedMinions: number;
			availableLibraryMinions: number;
			conditions: number;
		};
	};
	actions: {
		local: ActionWorkspaceItem[];
		inherited: ActionWorkspaceItem[];
	};
	modifiers: {
		assignedActive: ModifierWorkspaceItem[];
		assignedInactive: ModifierWorkspaceItem[];
		availableFromLibrary: ModifierWorkspaceItem[];
	};
	rollMacros: {
		local: RollMacroWorkspaceItem[];
		inherited: RollMacroWorkspaceItem[];
	};
	minions: {
		assigned: MinionWorkspaceItem[];
		availableFromLibrary: MinionWorkspaceItem[];
	};
	conditions: {
		items: Condition[];
	};
	capabilities: {
		canRenameCharacter: boolean;
		canSetActiveCharacter: boolean;
		canDeleteCharacter: boolean;
		canUpdateImport: boolean;
		canManageActions: boolean;
		canUpdateModifierState: boolean;
		canManageRollMacros: boolean;
		canManageMinions: boolean;
	};
};

export type LibraryWorkspace = {
	overview: {
		sharedActionCount: number;
		sharedRollMacroCount: number;
		unassignedModifierCount: number;
		unassignedMinionCount: number;
	};
	sharedActions: ActionWorkspaceItem[];
	sharedRollMacros: RollMacroWorkspaceItem[];
	unassignedModifiers: ModifierWorkspaceItem[];
	unassignedMinions: MinionWorkspaceItem[];
	capabilities: {
		canCreateRollMacro: boolean;
		canImportWgCharacter: boolean;
		canImportPathbuilderCharacter: boolean;
		canManageModifiers: boolean;
		canManageMinions: boolean;
	};
};

export const zActionWorkspaceItem: z.ZodType<ActionWorkspaceItem> = z.object({
	meta: zResourceMeta,
	payload: zAction,
});

export const zRollMacroWorkspaceItem: z.ZodType<RollMacroWorkspaceItem> = z.object({
	meta: zResourceMeta,
	payload: zRollMacro,
});

export const zModifierWorkspaceItem: z.ZodType<ModifierWorkspaceItem> = z.object({
	meta: zResourceMeta,
	payload: zModifier,
});

export const zMinionWorkspaceSummary: z.ZodType<MinionWorkspaceSummary> = z.object({
	level: z.number().nullable(),
	ancestry: z.string().nullable(),
	class: z.string().nullable(),
	characterId: z.number().nullable(),
	autoJoinInitiative: z.boolean(),
});

export const zMinionWorkspaceItem: z.ZodType<MinionWorkspaceItem> = z.object({
	meta: zResourceMeta,
	summary: zMinionWorkspaceSummary,
	payload: zMinionWithRelations,
});

export const zCharacterSheetSummary: z.ZodType<CharacterSheetSummary> = z.object({
	level: z.number().nullable(),
	heritage: z.string().nullable(),
	ancestry: z.string().nullable(),
	class: z.string().nullable(),
	imageUrl: z.string().nullable(),
});

export const zCharacterManagementListItem: z.ZodType<CharacterManagementListItem> = z.object({
	id: z.number(),
	name: z.string(),
	importSource: zImportSourceEnum,
	charId: z.number(),
	isActiveCharacter: z.boolean(),
	summary: z.object({
		level: z.number().nullable(),
		heritage: z.string().nullable(),
		ancestry: z.string().nullable(),
		class: z.string().nullable(),
	}),
	counts: z.object({
		modifiers: z.number(),
		visibleActions: z.number(),
		visibleRollMacros: z.number(),
		assignedMinions: z.number(),
	}),
});

export const zCharacterWorkspace: z.ZodType<CharacterWorkspace> = z.object({
	character: z.object({
		id: z.number(),
		name: z.string(),
		importSource: zImportSourceEnum,
		charId: z.number(),
		isActiveCharacter: z.boolean(),
		sheetRecordId: z.number(),
		summary: zCharacterSheetSummary,
	}),
	overview: z.object({
		source: zImportSourceEnum,
		counts: z.object({
			localActions: z.number(),
			inheritedActions: z.number(),
			assignedActiveModifiers: z.number(),
			assignedInactiveModifiers: z.number(),
			availableLibraryModifiers: z.number(),
			localRollMacros: z.number(),
			inheritedRollMacros: z.number(),
			assignedMinions: z.number(),
			availableLibraryMinions: z.number(),
			conditions: z.number(),
		}),
	}),
	actions: z.object({
		local: z.array(zActionWorkspaceItem),
		inherited: z.array(zActionWorkspaceItem),
	}),
	modifiers: z.object({
		assignedActive: z.array(zModifierWorkspaceItem),
		assignedInactive: z.array(zModifierWorkspaceItem),
		availableFromLibrary: z.array(zModifierWorkspaceItem),
	}),
	rollMacros: z.object({
		local: z.array(zRollMacroWorkspaceItem),
		inherited: z.array(zRollMacroWorkspaceItem),
	}),
	minions: z.object({
		assigned: z.array(zMinionWorkspaceItem),
		availableFromLibrary: z.array(zMinionWorkspaceItem),
	}),
	conditions: z.object({
		items: z.array(zCondition),
	}),
	capabilities: z.object({
		canRenameCharacter: z.boolean(),
		canSetActiveCharacter: z.boolean(),
		canDeleteCharacter: z.boolean(),
		canUpdateImport: z.boolean(),
		canManageActions: z.boolean(),
		canUpdateModifierState: z.boolean(),
		canManageRollMacros: z.boolean(),
		canManageMinions: z.boolean(),
	}),
});

export const zLibraryWorkspace: z.ZodType<LibraryWorkspace> = z.object({
	overview: z.object({
		sharedActionCount: z.number(),
		sharedRollMacroCount: z.number(),
		unassignedModifierCount: z.number(),
		unassignedMinionCount: z.number(),
	}),
	sharedActions: z.array(zActionWorkspaceItem),
	sharedRollMacros: z.array(zRollMacroWorkspaceItem),
	unassignedModifiers: z.array(zModifierWorkspaceItem),
	unassignedMinions: z.array(zMinionWorkspaceItem),
	capabilities: z.object({
		canCreateRollMacro: z.boolean(),
		canImportWgCharacter: z.boolean(),
		canImportPathbuilderCharacter: z.boolean(),
		canManageModifiers: z.boolean(),
		canManageMinions: z.boolean(),
	}),
});

export function makeResourceCapabilities(
	overrides: Partial<ResourceCapabilities> = {}
): ResourceCapabilities {
	return {
		canEdit: false,
		canDelete: false,
		canAssign: false,
		canUnassign: false,
		canMoveToLibrary: false,
		canCopy: false,
		canToggleActive: false,
		canUpdateSeverity: false,
		...overrides,
	};
}

function buildResourceMeta({
	id,
	name,
	scope,
	assignment,
	source,
	capabilities,
}: {
	id: number;
	name: string;
	scope: WorkspaceScope;
	assignment: WorkspaceAssignment;
	source: string | null;
	capabilities?: Partial<ResourceCapabilities>;
}): ResourceMeta {
	return {
		id,
		name,
		scope,
		assignment,
		source,
		capabilities: makeResourceCapabilities(capabilities),
	};
}

export function getCharacterSheetSummary(sheet: {
	staticInfo: { level: number | null };
	info: {
		heritage: string | null;
		ancestry: string | null;
		class: string | null;
		imageURL?: string | null;
	};
}): CharacterSheetSummary {
	return {
		level: sheet.staticInfo.level ?? null,
		heritage: sheet.info.heritage ?? null,
		ancestry: sheet.info.ancestry ?? null,
		class: sheet.info.class ?? null,
		imageUrl: sheet.info.imageURL ?? null,
	};
}

export function toActionWorkspaceItem(
	action: Action,
	options: {
		scope: WorkspaceScope;
		assignment: WorkspaceAssignment;
		source: string | null;
		capabilities?: Partial<ResourceCapabilities>;
	}
): ActionWorkspaceItem {
	return {
		meta: buildResourceMeta({
			id: action.id,
			name: action.name,
			scope: options.scope,
			assignment: options.assignment,
			source: options.source,
			capabilities: options.capabilities,
		}),
		payload: action,
	};
}

export function toRollMacroWorkspaceItem(
	rollMacro: RollMacro,
	options: {
		scope: WorkspaceScope;
		assignment: WorkspaceAssignment;
		source: string | null;
		capabilities?: Partial<ResourceCapabilities>;
	}
): RollMacroWorkspaceItem {
	return {
		meta: buildResourceMeta({
			id: rollMacro.id,
			name: rollMacro.name,
			scope: options.scope,
			assignment: options.assignment,
			source: options.source,
			capabilities: options.capabilities,
		}),
		payload: rollMacro,
	};
}

export function toModifierWorkspaceItem(
	modifier: Modifier,
	options: {
		scope: WorkspaceScope;
		assignment: WorkspaceAssignment;
		source: string | null;
		capabilities?: Partial<ResourceCapabilities>;
	}
): ModifierWorkspaceItem {
	return {
		meta: buildResourceMeta({
			id: modifier.id,
			name: modifier.name,
			scope: options.scope,
			assignment: options.assignment,
			source: options.source,
			capabilities: options.capabilities,
		}),
		payload: modifier,
	};
}

export function toMinionWorkspaceItem(
	minion: MinionWithRelations,
	options: {
		scope: WorkspaceScope;
		assignment: WorkspaceAssignment;
		source: string | null;
		capabilities?: Partial<ResourceCapabilities>;
	}
): MinionWorkspaceItem {
	return {
		meta: buildResourceMeta({
			id: minion.id,
			name: minion.name,
			scope: options.scope,
			assignment: options.assignment,
			source: options.source,
			capabilities: options.capabilities,
		}),
		summary: {
			level: minion.sheetRecord.sheet.staticInfo.level ?? null,
			ancestry: minion.sheetRecord.sheet.info.ancestry ?? null,
			class: minion.sheetRecord.sheet.info.class ?? null,
			characterId: minion.characterId ?? null,
			autoJoinInitiative: minion.autoJoinInitiative,
		},
		payload: minion,
	};
}
