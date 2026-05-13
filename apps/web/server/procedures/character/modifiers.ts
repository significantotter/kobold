import { zModifier } from '@kobold/db';
import { orpc, requireAuth, recomputeAdjustedSheetForSheetRecord, recomputeAdjustedSheetsForUser, applyModifierStateUpdate, zUpdateModifierStateInput } from './shared.js';

export const updateModifierState = orpc
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

