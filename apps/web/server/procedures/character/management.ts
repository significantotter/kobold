import { z } from 'zod';
import {
	zCharacterManagementListItem,
	zCharacterWorkspace,
	getCharacterSheetSummary,
	makeSheetPreviewSummary,
	toActionWorkspaceItem,
	toMinionWorkspaceItem,
	toModifierWorkspaceItem,
	toRollMacroWorkspaceItem,
} from '../workspace-shared.js';
import {
	orpc,
	requireAuth,
	getOwnedCharacterOrThrow,
	assertUniqueCharacterName,
	deleteOwnedCharacter,
	zRenameCharacterInput,
	zCharacterMutationResult,
} from './shared.js';

export const listMyCharacters = orpc
	.input(z.object({}).optional())
	.output(z.array(zCharacterManagementListItem))
	.handler(async ({ context }) => {
		requireAuth(context.userId);
		const userId = context.userId;

		const [characters, actions, rollMacros, modifiers, minions] = await Promise.all([
			context.kobold.character.readManyForList({ userId }),
			context.kobold.action.readManyByUser({ userId, filter: 'all' }),
			context.kobold.rollMacro.readManyByUser({ userId, filter: 'all' }),
			context.kobold.modifier.readManyByUser({ userId, filter: 'all' }),
			context.kobold.minion.readManyByUserIdLite({ userId }),
		]);

		const userWideActionCount = actions.filter(action => action.sheetRecordId === null).length;
		const userWideRollMacroCount = rollMacros.filter(
			rollMacro => rollMacro.sheetRecordId === null
		).length;

		const localActionCounts = new Map<number, number>();
		for (const action of actions) {
			if (action.sheetRecordId === null) continue;
			localActionCounts.set(
				action.sheetRecordId,
				(localActionCounts.get(action.sheetRecordId) ?? 0) + 1
			);
		}

		const localRollMacroCounts = new Map<number, number>();
		for (const rollMacro of rollMacros) {
			if (rollMacro.sheetRecordId === null) continue;
			localRollMacroCounts.set(
				rollMacro.sheetRecordId,
				(localRollMacroCounts.get(rollMacro.sheetRecordId) ?? 0) + 1
			);
		}

		const modifierCounts = new Map<number, number>();
		for (const modifier of modifiers) {
			if (modifier.sheetRecordId === null) continue;
			modifierCounts.set(
				modifier.sheetRecordId,
				(modifierCounts.get(modifier.sheetRecordId) ?? 0) + 1
			);
		}

		const minionCounts = new Map<number, number>();
		for (const minion of minions) {
			if (minion.characterId === null) continue;
			minionCounts.set(minion.characterId, (minionCounts.get(minion.characterId) ?? 0) + 1);
		}

		return characters.map(character => ({
			id: character.id,
			name: character.name,
			importSource: character.importSource,
			charId: character.charId,
			isActiveCharacter: character.isActiveCharacter,
			summary: makeSheetPreviewSummary({
				level: character.sheetInfo.level,
				heritage: character.sheetInfo.heritage,
				ancestry: character.sheetInfo.ancestry,
				class: character.sheetInfo.class,
				imageUrl: character.sheetInfo.imageUrl,
				hp:
					character.sheetInfo.hpCurrent === null
						? null
						: {
								current: character.sheetInfo.hpCurrent,
								max: character.sheetInfo.hpMax,
							},
				ac: character.sheetInfo.ac,
				perception: character.sheetInfo.perception,
				saves: {
					fortitude: character.sheetInfo.fortitude,
					reflex: character.sheetInfo.reflex,
					will: character.sheetInfo.will,
				},
				speed: character.sheetInfo.speed,
			}),
			counts: {
				modifiers: modifierCounts.get(character.sheetRecordId) ?? 0,
				visibleActions:
					(localActionCounts.get(character.sheetRecordId) ?? 0) + userWideActionCount,
				visibleRollMacros:
					(localRollMacroCounts.get(character.sheetRecordId) ?? 0) +
					userWideRollMacroCount,
				assignedMinions: minionCounts.get(character.id) ?? 0,
			},
		}));
	});

export const getCharacterWorkspace = orpc
	.input(
		z.object({
			characterId: z.number(),
		})
	)
	.output(zCharacterWorkspace.nullable())
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);

		const character = await context.kobold.character.read({
			id: input.characterId,
			userId: context.userId,
		});
		if (!character) {
			return null;
		}

		const [availableLibraryModifiers, allUserMinions] = await Promise.all([
			context.kobold.modifier.readManyUserWide({ userId: context.userId }),
			context.kobold.minion.readManyByUserId({ userId: context.userId }),
		]);

		const localActions = character.actions.filter(
			action => action.sheetRecordId === character.sheetRecordId
		);
		const inheritedActions = character.actions.filter(action => action.sheetRecordId === null);
		const localRollMacros = character.rollMacros.filter(
			rollMacro => rollMacro.sheetRecordId === character.sheetRecordId
		);
		const inheritedRollMacros = character.rollMacros.filter(
			rollMacro => rollMacro.sheetRecordId === null
		);
		const assignedActiveModifiers = character.modifiers.filter(modifier => modifier.isActive);
		const assignedInactiveModifiers = character.modifiers.filter(
			modifier => !modifier.isActive
		);
		const assignedMinions = allUserMinions.filter(
			minion => minion.characterId === character.id
		);
		const availableLibraryMinions = allUserMinions.filter(
			minion => minion.characterId === null
		);

		const characterSummary = getCharacterSheetSummary(character.sheetRecord.sheet);

		return {
			character: {
				id: character.id,
				name: character.name,
				importSource: character.importSource,
				charId: character.charId,
				isActiveCharacter: character.isActiveCharacter,
				sheetRecordId: character.sheetRecordId,
				summary: characterSummary,
				sheet: character.sheetRecord.sheet,
			},
			overview: {
				source: character.importSource,
				counts: {
					localActions: localActions.length,
					inheritedActions: inheritedActions.length,
					assignedActiveModifiers: assignedActiveModifiers.length,
					assignedInactiveModifiers: assignedInactiveModifiers.length,
					availableLibraryModifiers: availableLibraryModifiers.length,
					localRollMacros: localRollMacros.length,
					inheritedRollMacros: inheritedRollMacros.length,
					assignedMinions: assignedMinions.length,
					availableLibraryMinions: availableLibraryMinions.length,
					conditions: character.sheetRecord.conditions.length,
				},
			},
			actions: {
				local: localActions.map(action =>
					toActionWorkspaceItem(action, {
						scope: 'character',
						assignment: 'local',
						source: character.name,
					})
				),
				inherited: inheritedActions.map(action =>
					toActionWorkspaceItem(action, {
						scope: 'library',
						assignment: 'inherited-all',
						source: 'Library',
					})
				),
			},
			modifiers: {
				assignedActive: assignedActiveModifiers.map(modifier =>
					toModifierWorkspaceItem(modifier, {
						scope: 'character',
						assignment: 'local',
						source: character.name,
						capabilities: {
							canToggleActive: true,
							canUpdateSeverity: true,
						},
					})
				),
				assignedInactive: assignedInactiveModifiers.map(modifier =>
					toModifierWorkspaceItem(modifier, {
						scope: 'character',
						assignment: 'local',
						source: character.name,
						capabilities: {
							canToggleActive: true,
							canUpdateSeverity: true,
						},
					})
				),
				availableFromLibrary: availableLibraryModifiers.map(modifier =>
					toModifierWorkspaceItem(modifier, {
						scope: 'library',
						assignment: 'none',
						source: 'Library',
					})
				),
			},
			rollMacros: {
				local: localRollMacros.map(rollMacro =>
					toRollMacroWorkspaceItem(rollMacro, {
						scope: 'character',
						assignment: 'local',
						source: character.name,
						capabilities: {
							canEdit: true,
							canDelete: true,
						},
					})
				),
				inherited: inheritedRollMacros.map(rollMacro =>
					toRollMacroWorkspaceItem(rollMacro, {
						scope: 'library',
						assignment: 'inherited-all',
						source: 'Library',
					})
				),
			},
			minions: {
				assigned: assignedMinions.map(minion =>
					toMinionWorkspaceItem(minion, {
						scope: 'character',
						assignment: 'assigned-character',
						source: character.name,
						capabilities: {
							canEdit: true,
							canDelete: true,
							canUnassign: true,
						},
					})
				),
				availableFromLibrary: availableLibraryMinions.map(minion =>
					toMinionWorkspaceItem(minion, {
						scope: 'library',
						assignment: 'none',
						source: 'Library',
						capabilities: {
							canAssign: true,
						},
					})
				),
			},
			conditions: {
				items: character.sheetRecord.conditions,
			},
			capabilities: {
				canRenameCharacter: true,
				canSetActiveCharacter: true,
				canDeleteCharacter: true,
				canUpdateImport: true,
				canManageActions: false,
				canUpdateModifierState: true,
				canManageRollMacros: true,
				canManageMinions: true,
			},
		};
	});

export const renameCharacter = orpc
	.input(zRenameCharacterInput)
	.output(zCharacterMutationResult)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const character = await getOwnedCharacterOrThrow({
			context,
			characterId: input.characterId,
		});

		await assertUniqueCharacterName({
			context,
			userId: context.userId,
			name: input.name,
			excludeCharacterId: input.characterId,
		});

		await context.kobold.character.updateName({
			id: input.characterId,
			userId: context.userId,
			name: input.name,
		});

		return {
			characterId: character.id,
			name: input.name,
		};
	});

export const setActiveCharacter = orpc
	.input(z.object({ characterId: z.number() }))
	.output(zCharacterMutationResult)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const character = await getOwnedCharacterOrThrow({
			context,
			characterId: input.characterId,
		});

		await context.kobold.character.setIsActive({
			id: input.characterId,
			userId: context.userId,
		});

		return {
			characterId: character.id,
			name: character.name,
		};
	});

export const deleteCharacter = orpc
	.input(z.object({ characterId: z.number() }))
	.output(z.object({ deletedCharacterId: z.number() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		await deleteOwnedCharacter({ context, characterId: input.characterId });

		return {
			deletedCharacterId: input.characterId,
		};
	});
