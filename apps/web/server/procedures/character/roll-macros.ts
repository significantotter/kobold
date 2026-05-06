import { z } from 'zod';
import { zRollMacro } from '@kobold/db';
import { orpc, requireAuth, resolveOwnedRollMacroSheetRecordId, assertUniqueRollMacroName, applyRollMacroUpdate, zCreateRollMacroInput, zUpdateRollMacroInput, zDeleteRollMacroInput } from './shared.js';

export const createRollMacro = orpc
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

export const updateRollMacro = orpc
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

export const deleteRollMacro = orpc
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

