import { os, type DecoratedProcedure } from '@orpc/server';
import { z } from 'zod';
import {
	zMinionWithRelations,
	type Modifier,
	type MinionWithRelations,
	type RollMacro,
} from '@kobold/db';
import { SheetUtils, convertPathBuilderToSheet } from '@kobold/sheet';
import { PathBuilder } from '@kobold/schema';
import type { Sheet, SheetBaseCounterKeys } from '@kobold/schema';
import type { AppContext } from '../../context.js';

export const orpc = os.$context<AppContext>();

export const zWgV4Import = z.object({
	version: z.number(),
	character: z.record(z.string(), z.any()),
	content: z.record(z.string(), z.any()),
});

export const zPathbuilderImport = z.object({
	jsonId: z.number().int().positive(),
	useStamina: z.boolean().optional().default(false),
});

export const zRenameCharacterInput = z.object({
	characterId: z.number(),
	name: z.string().trim().min(1).max(100),
});

export const zCharacterMutationResult = z.object({
	characterId: z.number(),
	name: z.string(),
});

export const zUpdateModifierStateInput = z
	.object({
		modifierId: z.number(),
		isActive: z.boolean().optional(),
		severity: z.number().int().nullable().optional(),
	})
	.refine(input => input.isActive !== undefined || input.severity !== undefined, {
		message: 'Provide at least one modifier change.',
	});

export const zCreateRollMacroInput = z.object({
	characterId: z.number().nullable().optional(),
	name: z.string().trim().min(1).max(100),
	macro: z.string().trim().min(1).max(500),
});

export const zUpdateRollMacroInput = z
	.object({
		rollMacroId: z.number(),
		name: z.string().trim().min(1).max(100).optional(),
		macro: z.string().trim().min(1).max(500).optional(),
	})
	.refine(input => input.name !== undefined || input.macro !== undefined, {
		message: 'Provide at least one roll macro change.',
	});

export const zDeleteRollMacroInput = z.object({
	rollMacroId: z.number(),
});

export const zRenameMinionInput = z.object({
	minionId: z.number(),
	name: z.string().trim().min(1).max(100),
});

export const zAssignMinionInput = z.object({
	minionId: z.number(),
	characterId: z.number().nullable(),
});

export const zUnassignMinionInput = z.object({
	minionId: z.number(),
});

export const zUpdateMinionAutoJoinInitiativeInput = z.object({
	minionId: z.number(),
	autoJoinInitiative: z.boolean(),
});

export const zDeleteMinionInput = z.object({
	minionId: z.number(),
});

export function requireAuth(userId: string | null): asserts userId is string {
	if (!userId) {
		throw new Error('You must be logged in to perform this action.');
	}
}

export type MinionMutationProcedure<TInputSchema extends z.ZodTypeAny> = DecoratedProcedure<
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
export function preserveSheetTrackerValues(newSheet: Sheet, oldSheet: Sheet): Sheet {
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

export async function fetchPathbuilderSheet({
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

export async function recomputeAdjustedSheetForSheetRecord({
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

export async function recomputeAdjustedSheetsForUser({
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

export async function getOwnedCharacterOrThrow({
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

export async function assertUniqueCharacterName({
	context,
	userId,
	name,
	excludeCharacterId,
}: {
	context: AppContext;
	userId: string;
	name: string;
	excludeCharacterId?: number;
}): Promise<void> {
	const existing = await context.kobold.character.readLite({
		exactName: name,
		userId,
	});
	if (existing && existing.id !== excludeCharacterId) {
		throw new Error(
			`You already have a character named "${existing.name}". Please choose a unique name.`
		);
	}
}

export async function getOwnedMinionOrThrow({
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

export async function resolveOwnedRollMacroSheetRecordId({
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

export async function assertUniqueRollMacroName({
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

export async function deleteOwnedCharacter({
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
				await trx.character.setIsActive(
					{
						id: nextCharacter.id,
						userId: context.userId!,
					},
					trx.db
				);
			}
		}
	});
}

export async function assertUniqueMinionNameInScope({
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

export async function moveOwnedMinion({
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

export async function deleteOwnedMinion({
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

export function applyModifierStateUpdate({
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

export function applyRollMacroUpdate({
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
