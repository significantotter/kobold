import { os, type DecoratedProcedure } from '@orpc/server';
import { z } from 'zod';
import {
	ImportSourceEnum,
	zMinionWithRelations,
	zModifier,
	zRollMacro,
	type Modifier,
	type MinionWithRelations,
	type RollMacro,
} from '@kobold/db';
import {
	SheetUtils,
	convertPathBuilderToSheet,
	convertWgV4ExportToSheet,
	type WgV4Export,
} from '@kobold/sheet';
import { PathBuilder } from '@kobold/schema';
import type { Sheet, SheetBaseCounterKeys } from '@kobold/schema';
import type { AppContext } from '../context.js';
import {
	zCharacterManagementListItem,
	zCharacterWorkspace,
	getCharacterSheetSummary,
	toActionWorkspaceItem,
	toMinionWorkspaceItem,
	toModifierWorkspaceItem,
	toRollMacroWorkspaceItem,
} from './workspace-shared.js';

const orpc = os.$context<AppContext>();

const zWgV4Import = z.object({
	version: z.number(),
	character: z.record(z.string(), z.any()),
	content: z.record(z.string(), z.any()),
});

const zPathbuilderImport = z.object({
	jsonId: z.number().int().positive(),
	useStamina: z.boolean().optional().default(false),
});

const zRenameCharacterInput = z.object({
	characterId: z.number(),
	name: z.string().trim().min(1).max(100),
});

const zCharacterMutationResult = z.object({
	characterId: z.number(),
	name: z.string(),
});

const zUpdateModifierStateInput = z
	.object({
		modifierId: z.number(),
		isActive: z.boolean().optional(),
		severity: z.number().int().nullable().optional(),
	})
	.refine(input => input.isActive !== undefined || input.severity !== undefined, {
		message: 'Provide at least one modifier change.',
	});

const zCreateRollMacroInput = z.object({
	characterId: z.number().nullable().optional(),
	name: z.string().trim().min(1).max(100),
	macro: z.string().trim().min(1).max(500),
});

const zUpdateRollMacroInput = z
	.object({
		rollMacroId: z.number(),
		name: z.string().trim().min(1).max(100).optional(),
		macro: z.string().trim().min(1).max(500).optional(),
	})
	.refine(input => input.name !== undefined || input.macro !== undefined, {
		message: 'Provide at least one roll macro change.',
	});

const zDeleteRollMacroInput = z.object({
	rollMacroId: z.number(),
});

const zRenameMinionInput = z.object({
	minionId: z.number(),
	name: z.string().trim().min(1).max(100),
});

const zAssignMinionInput = z.object({
	minionId: z.number(),
	characterId: z.number().nullable(),
});

const zUnassignMinionInput = z.object({
	minionId: z.number(),
});

const zUpdateMinionAutoJoinInitiativeInput = z.object({
	minionId: z.number(),
	autoJoinInitiative: z.boolean(),
});

const zDeleteMinionInput = z.object({
	minionId: z.number(),
});

function requireAuth(userId: string | null): asserts userId is string {
	if (!userId) {
		throw new Error('You must be logged in to perform this action.');
	}
}

type MinionMutationProcedure<TInputSchema extends z.ZodTypeAny> = DecoratedProcedure<
	AppContext,
	AppContext,
	TInputSchema,
	typeof zMinionWithRelations,
	Record<never, never>,
	Record<never, never>
>;

/**
 * Copies current counter values and custom counter groups from an old sheet to a new one,
 * clamping values to the new max where applicable.
 */
function preserveSheetTrackerValues(newSheet: Sheet, oldSheet: Sheet): Sheet {
	for (const key in newSheet.baseCounters) {
		const k = key as SheetBaseCounterKeys;
		newSheet.baseCounters[k].current =
			oldSheet.baseCounters[k].current ?? newSheet.baseCounters[k].current;
		if (newSheet.baseCounters[k].max !== null) {
			newSheet.baseCounters[k].current = Math.min(
				newSheet.baseCounters[k].current,
				newSheet.baseCounters[k].max!
			);
		}
	}
	newSheet.counterGroups = oldSheet.counterGroups;
	newSheet.countersOutsideGroups = oldSheet.countersOutsideGroups;
	return newSheet;
}

async function fetchPathbuilderSheet({
	jsonId,
	useStamina,
}: {
	jsonId: number;
	useStamina: boolean;
}): Promise<Sheet> {
	const exportData = await new PathBuilder().get({ characterJsonId: jsonId });
	if (!exportData.success) {
		throw new Error(
			'Failed to load Pathbuilder character. Verify the JSON ID and export the character in Pathbuilder before trying again.'
		);
	}

	return convertPathBuilderToSheet(exportData.build, { useStamina });
}

async function recomputeAdjustedSheetForSheetRecord({
	context,
	sheetRecordId,
}: {
	context: AppContext;
	sheetRecordId: number;
}): Promise<void> {
	const sheetRecord = await context.kobold.sheetRecord.read({ id: sheetRecordId });
	if (!sheetRecord) return;

	const modifiers = await context.kobold.modifier.readManyBySheetRecordId({
		sheetRecordId,
	});

	const adjustedSheet = SheetUtils.adjustSheetWithModifiers(sheetRecord.sheet, [
		...(sheetRecord.conditions ?? []),
		...modifiers,
	]);

	await context.kobold.sheetRecord.update({ id: sheetRecordId }, { adjustedSheet });
}

async function recomputeAdjustedSheetsForUser({
	context,
	userId,
}: {
	context: AppContext;
	userId: string;
}): Promise<void> {
	const characters = await context.kobold.character.readManyLite({ userId });
	await Promise.all(
		characters.map(character =>
			recomputeAdjustedSheetForSheetRecord({
				context,
				sheetRecordId: character.sheetRecordId,
			})
		)
	);
}

async function getOwnedCharacterOrThrow({
	context,
	characterId,
}: {
	context: AppContext;
	characterId: number;
}) {
	const character = await context.kobold.character.readLite({
		id: characterId,
		userId: context.userId!,
	});
	if (!character) {
		throw new Error('Character not found or does not belong to you.');
	}
	return character;
}

async function getOwnedMinionOrThrow({
	context,
	minionId,
}: {
	context: AppContext;
	minionId: number;
}): Promise<MinionWithRelations> {
	const minion = await context.kobold.minion.read({ id: minionId });
	if (!minion || minion.userId !== context.userId) {
		throw new Error('Minion not found or does not belong to you.');
	}
	return minion;
}

async function resolveOwnedRollMacroSheetRecordId({
	context,
	characterId,
}: {
	context: AppContext;
	characterId: number | null | undefined;
}): Promise<number | null> {
	if (characterId == null) return null;
	const character = await getOwnedCharacterOrThrow({ context, characterId });
	return character.sheetRecordId;
}

async function assertUniqueRollMacroName({
	context,
	userId,
	name,
	sheetRecordId,
	excludeRollMacroId,
}: {
	context: AppContext;
	userId: string;
	name: string;
	sheetRecordId: number | null;
	excludeRollMacroId?: number;
}): Promise<void> {
	const existingRollMacros =
		sheetRecordId === null
			? await context.kobold.rollMacro.readManyUserWide({ userId })
			: await context.kobold.rollMacro.readManyForCharacter({ userId, sheetRecordId });

	const duplicate = existingRollMacros.find(
		rollMacro =>
			rollMacro.id !== excludeRollMacroId &&
			rollMacro.name.trim().toLowerCase() === name.trim().toLowerCase()
	);
	if (duplicate) {
		throw new Error(`A roll macro named "${name}" already exists in this scope.`);
	}
}

async function deleteOwnedCharacter({
	context,
	characterId,
}: {
	context: AppContext;
	characterId: number;
}): Promise<void> {
	const character = await getOwnedCharacterOrThrow({ context, characterId });

	await context.kobold.transaction(async trx => {
		await trx.character.delete({ id: characterId, userId: context.userId! });
		await trx.sheetRecord.deleteOrphaned();

		if (character.isActiveCharacter) {
			const nextCharacter = await trx.character.readLite({ userId: context.userId! });
			if (nextCharacter) {
				await trx.character.setIsActive({
					id: nextCharacter.id,
					userId: context.userId!,
				});
			}
		}
	});
}

async function assertUniqueMinionNameInScope({
	context,
	userId,
	name,
	characterId,
	excludeMinionId,
}: {
	context: AppContext;
	userId: string;
	name: string;
	characterId: number | null;
	excludeMinionId?: number;
}): Promise<void> {
	const existingMinions =
		characterId === null
			? (await context.kobold.minion.readManyByUserIdLite({ userId })).filter(
					minion => minion.characterId === null
				)
			: await context.kobold.minion.readManyLite({ characterId });

	const duplicate = existingMinions.find(
		minion =>
			minion.id !== excludeMinionId &&
			minion.name.trim().toLowerCase() === name.trim().toLowerCase()
	);
	if (duplicate) {
		throw new Error(`A minion named "${name}" already exists in that scope.`);
	}
}

async function moveOwnedMinion({
	context,
	minionId,
	characterId,
}: {
	context: AppContext;
	minionId: number;
	characterId: number | null;
}): Promise<MinionWithRelations> {
	const minion = await getOwnedMinionOrThrow({ context, minionId });

	if (characterId !== null) {
		await getOwnedCharacterOrThrow({ context, characterId });
	}

	await assertUniqueMinionNameInScope({
		context,
		userId: context.userId!,
		name: minion.name,
		characterId,
		excludeMinionId: minion.id,
	});

	return context.kobold.minion.update({ id: minion.id }, { characterId });
}

async function deleteOwnedMinion({
	context,
	minionId,
}: {
	context: AppContext;
	minionId: number;
}): Promise<void> {
	const minion = await getOwnedMinionOrThrow({ context, minionId });

	await context.kobold.transaction(async trx => {
		const initiativeActors = await trx.initiativeActor.readManyByMinionIdLite({
			minionId: minion.id,
		});

		for (const actor of initiativeActors) {
			const actorsInGroup = await trx.initiativeActor.readManyByGroupIdLite({
				groupId: actor.initiativeActorGroupId,
			});

			await trx.initiativeActor.delete({ id: actor.id });

			if (actorsInGroup.length === 1) {
				await trx.initiativeActorGroup.delete({ id: actor.initiativeActorGroupId });
			}
		}

		await trx.sheetRecord.delete({ id: minion.sheetRecordId });
	});
}

function applyModifierStateUpdate({
	modifier,
	input,
}: {
	modifier: Modifier;
	input: z.infer<typeof zUpdateModifierStateInput>;
}) {
	return {
		isActive: input.isActive ?? modifier.isActive,
		severity: input.severity === undefined ? modifier.severity : input.severity,
	};
}

function applyRollMacroUpdate({
	rollMacro,
	input,
}: {
	rollMacro: RollMacro;
	input: z.infer<typeof zUpdateRollMacroInput>;
}) {
	return {
		name: input.name ?? rollMacro.name,
		macro: input.macro ?? rollMacro.macro,
	};
}

const listMyCharacters = orpc
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
			summary: {
				level: character.sheetInfo.level,
				heritage: character.sheetInfo.heritage,
				ancestry: character.sheetInfo.ancestry,
				class: character.sheetInfo.class,
			},
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

const getCharacterWorkspace = orpc
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

const renameCharacter = orpc
	.input(zRenameCharacterInput)
	.output(zCharacterMutationResult)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const character = await getOwnedCharacterOrThrow({
			context,
			characterId: input.characterId,
		});

		await context.kobold.character.updateFields(
			{ id: input.characterId },
			{ name: input.name }
		);

		return {
			characterId: character.id,
			name: input.name,
		};
	});

const setActiveCharacter = orpc
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

const deleteCharacter = orpc
	.input(z.object({ characterId: z.number() }))
	.output(z.object({ deletedCharacterId: z.number() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		await deleteOwnedCharacter({ context, characterId: input.characterId });

		return {
			deletedCharacterId: input.characterId,
		};
	});

const updateModifierState = orpc
	.input(zUpdateModifierStateInput)
	.output(zModifier)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const modifier = await context.kobold.modifier.read({ id: input.modifierId });
		if (!modifier || modifier.userId !== context.userId) {
			throw new Error('Modifier not found or does not belong to you.');
		}

		const updatedModifier = await context.kobold.modifier.update(
			{ id: input.modifierId },
			applyModifierStateUpdate({ modifier, input })
		);

		if (updatedModifier.sheetRecordId === null) {
			await recomputeAdjustedSheetsForUser({ context, userId: context.userId });
		} else {
			await recomputeAdjustedSheetForSheetRecord({
				context,
				sheetRecordId: updatedModifier.sheetRecordId,
			});
		}

		return updatedModifier;
	});

const createRollMacro = orpc
	.input(zCreateRollMacroInput)
	.output(zRollMacro)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const sheetRecordId = await resolveOwnedRollMacroSheetRecordId({
			context,
			characterId: input.characterId,
		});

		await assertUniqueRollMacroName({
			context,
			userId: context.userId,
			name: input.name,
			sheetRecordId,
		});

		return context.kobold.rollMacro.create({
			userId: context.userId,
			name: input.name,
			macro: input.macro,
			sheetRecordId,
		});
	});

const updateRollMacro = orpc
	.input(zUpdateRollMacroInput)
	.output(zRollMacro)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const rollMacro = await context.kobold.rollMacro.read({ id: input.rollMacroId });
		if (!rollMacro || rollMacro.userId !== context.userId) {
			throw new Error('Roll macro not found or does not belong to you.');
		}

		const nextValues = applyRollMacroUpdate({ rollMacro, input });
		await assertUniqueRollMacroName({
			context,
			userId: context.userId,
			name: nextValues.name,
			sheetRecordId: rollMacro.sheetRecordId,
			excludeRollMacroId: rollMacro.id,
		});

		return context.kobold.rollMacro.update({ id: rollMacro.id }, nextValues);
	});

const deleteRollMacro = orpc
	.input(zDeleteRollMacroInput)
	.output(z.object({ deletedRollMacroId: z.number() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const rollMacro = await context.kobold.rollMacro.read({ id: input.rollMacroId });
		if (!rollMacro || rollMacro.userId !== context.userId) {
			throw new Error('Roll macro not found or does not belong to you.');
		}

		await context.kobold.rollMacro.delete({ id: input.rollMacroId });

		return {
			deletedRollMacroId: input.rollMacroId,
		};
	});

const renameMinion: MinionMutationProcedure<typeof zRenameMinionInput> = orpc
	.input(zRenameMinionInput)
	.output(zMinionWithRelations)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const minion = await getOwnedMinionOrThrow({ context, minionId: input.minionId });

		await assertUniqueMinionNameInScope({
			context,
			userId: context.userId,
			name: input.name,
			characterId: minion.characterId,
			excludeMinionId: minion.id,
		});

		return context.kobold.minion.update({ id: minion.id }, { name: input.name });
	});

const assignMinion: MinionMutationProcedure<typeof zAssignMinionInput> = orpc
	.input(zAssignMinionInput)
	.output(zMinionWithRelations)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		return moveOwnedMinion({
			context,
			minionId: input.minionId,
			characterId: input.characterId,
		});
	});

const unassignMinion: MinionMutationProcedure<typeof zUnassignMinionInput> = orpc
	.input(zUnassignMinionInput)
	.output(zMinionWithRelations)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		return moveOwnedMinion({
			context,
			minionId: input.minionId,
			characterId: null,
		});
	});

const updateMinionAutoJoinInitiative: MinionMutationProcedure<
	typeof zUpdateMinionAutoJoinInitiativeInput
> = orpc
	.input(zUpdateMinionAutoJoinInitiativeInput)
	.output(zMinionWithRelations)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const minion = await getOwnedMinionOrThrow({ context, minionId: input.minionId });
		return context.kobold.minion.update(
			{ id: minion.id },
			{ autoJoinInitiative: input.autoJoinInitiative }
		);
	});

const deleteMinion = orpc
	.input(zDeleteMinionInput)
	.output(z.object({ deletedMinionId: z.number() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		await deleteOwnedMinion({ context, minionId: input.minionId });
		return {
			deletedMinionId: input.minionId,
		};
	});

const getCharacterLite = orpc
	.input(z.object({ characterId: z.number() }))
	.output(
		z
			.object({
				id: z.number(),
				name: z.string(),
				importSource: z.string(),
				isActiveCharacter: z.boolean(),
			})
			.nullable()
	)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);

		const character = await context.kobold.character.readLite({
			id: input.characterId,
			userId: context.userId,
		});
		if (!character) return null;

		return {
			id: character.id,
			name: character.name,
			importSource: character.importSource as string,
			isActiveCharacter: character.isActiveCharacter,
		};
	});

const getCharacter = orpc
	.input(z.object({ characterId: z.number() }))
	.output(
		z
			.object({
				id: z.number(),
				name: z.string(),
				importSource: z.string(),
				charId: z.number(),
				level: z.number().nullable(),
			})
			.nullable()
	)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);

		const character = await context.kobold.character.readLite({
			id: input.characterId,
			userId: context.userId,
		});
		if (!character) return null;

		const sheetRecord = await context.kobold.sheetRecord.read({
			id: character.sheetRecordId,
		});

		return {
			id: character.id,
			name: character.name,
			importSource: character.importSource as string,
			charId: character.charId,
			level: sheetRecord?.sheet.staticInfo.level ?? null,
		};
	});

const findWgCharacterByName = orpc
	.input(z.object({ name: z.string() }))
	.output(
		z
			.object({
				id: z.number(),
				name: z.string(),
			})
			.nullable()
	)
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);

		const characters = await context.kobold.character.readManyLite({
			name: input.name,
			userId: context.userId,
			importSource: ImportSourceEnum.wg,
		});
		if (!characters.length) return null;

		return {
			id: characters[0].id,
			name: characters[0].name,
		};
	});

const importWgCharacter = orpc
	.input(z.object({ exportData: zWgV4Import }))
	.output(z.object({ characterId: z.number(), name: z.string() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const userId = context.userId;

		const { exportData } = input;

		if (exportData.version !== 4) {
			throw new Error(
				`Unsupported WG export version: ${exportData.version}. Only version 4 is supported.`
			);
		}

		const sheet = convertWgV4ExportToSheet(exportData as WgV4Export);

		const existing = await context.kobold.character.readLite({
			exactName: sheet.staticInfo.name,
			userId,
		});
		if (existing) {
			throw new Error(
				`You already have a character named "${sheet.staticInfo.name}". ` +
					`Please rename or delete the existing character first.`
			);
		}

		const characterName = sheet.staticInfo.name;

		const { characterId } = await context.kobold.transaction(async trx => {
			const sheetRecord = await trx.sheetRecord.create({ sheet });

			const { id: createdCharacterId } = await trx.character.createReturningId({
				name: characterName,
				userId,
				sheetRecordId: sheetRecord.id,
				importSource: ImportSourceEnum.wg,
				charId: exportData.character.id ?? -1,
			});

			await trx.character.setIsActive({
				id: createdCharacterId,
				userId,
			});

			return { characterId: createdCharacterId };
		});

		return {
			characterId,
			name: characterName,
		};
	});

const updateWgCharacter = orpc
	.input(z.object({ characterId: z.number(), exportData: zWgV4Import }))
	.output(z.object({ characterId: z.number(), name: z.string() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);

		const { characterId, exportData } = input;

		if (exportData.version !== 4) {
			throw new Error(
				`Unsupported WG export version: ${exportData.version}. Only version 4 is supported.`
			);
		}

		const existing = await context.kobold.character.readLite({
			id: characterId,
			userId: context.userId,
		});
		if (!existing) {
			throw new Error('Character not found or does not belong to you.');
		}

		const existingSheetRecord = await context.kobold.sheetRecord.read({
			id: existing.sheetRecordId,
		});
		if (!existingSheetRecord) {
			throw new Error('Character sheet record not found.');
		}

		let sheet = convertWgV4ExportToSheet(exportData as WgV4Export);
		sheet = preserveSheetTrackerValues(sheet, existingSheetRecord.sheet);

		await context.kobold.sheetRecord.update({ id: existing.sheetRecordId }, { sheet });

		const newName = sheet.staticInfo.name;
		const newCharId = exportData.character.id ?? existing.charId;
		if (newName !== existing.name || newCharId !== existing.charId) {
			await context.kobold.character.updateFields(
				{ id: characterId },
				{ name: newName, charId: newCharId }
			);
		}

		return {
			characterId,
			name: newName,
		};
	});

const importPathbuilderCharacter = orpc
	.input(zPathbuilderImport)
	.output(z.object({ characterId: z.number(), name: z.string() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);
		const userId = context.userId;

		const sheet = await fetchPathbuilderSheet({
			jsonId: input.jsonId,
			useStamina: input.useStamina,
		});

		const existing = await context.kobold.character.readLite({
			exactName: sheet.staticInfo.name,
			userId,
		});
		if (existing) {
			throw new Error(
				`You already have a character named "${sheet.staticInfo.name}". ` +
					'Please rename or delete the existing character first.'
			);
		}

		const characterName = sheet.staticInfo.name;
		const { characterId } = await context.kobold.transaction(async trx => {
			const sheetRecord = await trx.sheetRecord.create({ sheet });

			const { id: createdCharacterId } = await trx.character.createReturningId({
				name: characterName,
				userId,
				sheetRecordId: sheetRecord.id,
				importSource: ImportSourceEnum.pathbuilder,
				charId: input.jsonId,
			});

			await trx.character.setIsActive({
				id: createdCharacterId,
				userId,
			});

			return { characterId: createdCharacterId };
		});

		return {
			characterId,
			name: characterName,
		};
	});

const updatePathbuilderCharacter = orpc
	.input(
		z.object({
			characterId: z.number(),
			jsonId: z.number().int().positive(),
			useStamina: z.boolean().optional().default(false),
		})
	)
	.output(z.object({ characterId: z.number(), name: z.string() }))
	.handler(async ({ input, context }) => {
		requireAuth(context.userId);

		const existing = await context.kobold.character.readLite({
			id: input.characterId,
			userId: context.userId,
		});
		if (!existing) {
			throw new Error('Character not found or does not belong to you.');
		}

		const existingSheetRecord = await context.kobold.sheetRecord.read({
			id: existing.sheetRecordId,
		});
		if (!existingSheetRecord) {
			throw new Error('Character sheet record not found.');
		}

		let sheet = await fetchPathbuilderSheet({
			jsonId: input.jsonId,
			useStamina: input.useStamina,
		});

		sheet.info.imageURL = existingSheetRecord.sheet.info.imageURL ?? sheet.info.imageURL;
		sheet = preserveSheetTrackerValues(sheet, existingSheetRecord.sheet);

		await context.kobold.sheetRecord.update({ id: existing.sheetRecordId }, { sheet });

		const newName = sheet.staticInfo.name;
		if (newName !== existing.name || input.jsonId !== existing.charId) {
			await context.kobold.character.updateFields(
				{ id: input.characterId },
				{ name: newName, charId: input.jsonId }
			);
		}

		return {
			characterId: input.characterId,
			name: newName,
		};
	});

type CharacterRouterShape = {
	listMyCharacters: typeof listMyCharacters;
	getCharacterWorkspace: typeof getCharacterWorkspace;
	renameCharacter: typeof renameCharacter;
	setActiveCharacter: typeof setActiveCharacter;
	deleteCharacter: typeof deleteCharacter;
	updateModifierState: typeof updateModifierState;
	createRollMacro: typeof createRollMacro;
	updateRollMacro: typeof updateRollMacro;
	deleteRollMacro: typeof deleteRollMacro;
	renameMinion: typeof renameMinion;
	assignMinion: typeof assignMinion;
	unassignMinion: typeof unassignMinion;
	updateMinionAutoJoinInitiative: typeof updateMinionAutoJoinInitiative;
	deleteMinion: typeof deleteMinion;
	getCharacterLite: typeof getCharacterLite;
	getCharacter: typeof getCharacter;
	findWgCharacterByName: typeof findWgCharacterByName;
	importWgCharacter: typeof importWgCharacter;
	updateWgCharacter: typeof updateWgCharacter;
	importPathbuilderCharacter: typeof importPathbuilderCharacter;
	updatePathbuilderCharacter: typeof updatePathbuilderCharacter;
};

const builtCharacterRouter: CharacterRouterShape = {
	listMyCharacters,
	getCharacterWorkspace,
	renameCharacter,
	setActiveCharacter,
	deleteCharacter,
	updateModifierState,
	createRollMacro,
	updateRollMacro,
	deleteRollMacro,
	renameMinion,
	assignMinion,
	unassignMinion,
	updateMinionAutoJoinInitiative,
	deleteMinion,
	getCharacterLite,
	getCharacter,
	findWgCharacterByName,
	importWgCharacter,
	updateWgCharacter,
	importPathbuilderCharacter,
	updatePathbuilderCharacter,
};

export { builtCharacterRouter as characterRouter };

export type CharacterRouter = typeof builtCharacterRouter;
