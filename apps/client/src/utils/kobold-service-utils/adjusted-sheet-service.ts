import { Kobold } from '@kobold/db';
import { SheetUtils } from '../sheet/sheet-utils.js';

/**
 * Service that recomputes the `adjusted_sheet` JSONB column on sheet_record.
 *
 * Call `recomputeAdjustedSheet()` fire-and-forget after any write that mutates:
 *   - sheet_record.sheet or sheet_record.conditions
 *   - modifier CRUD (create/update/delete)
 *   - modifier toggle (isActive / severity changes)
 *
 * The previous adjusted_sheet remains valid for concurrent reads during recomputation.
 */
export class AdjustedSheetService {
	constructor(private kobold: Kobold) {}

	/**
	 * Recomputes the adjusted sheet for a single sheet_record and writes it back.
	 */
	async recomputeAdjustedSheet({ sheetRecordId }: { sheetRecordId: number }): Promise<void> {
		const sheetRecord = await this.kobold.sheetRecord.read({ id: sheetRecordId });
		if (!sheetRecord) return;

		const modifiers = await this.kobold.modifier.readManyBySheetRecordId({
			sheetRecordId,
		});

		const adjustedSheet = SheetUtils.adjustSheetWithModifiers(sheetRecord.sheet, [
			...(sheetRecord.conditions ?? []),
			...modifiers,
		]);

		await this.kobold.sheetRecord.update({ id: sheetRecordId }, { adjustedSheet });
	}

	/**
	 * Recomputes adjusted sheets for ALL characters owned by a given user.
	 * Use this when a user-wide modifier (sheetRecordId = null) is changed,
	 * since it affects all the user's characters.
	 */
	async recomputeAllForUser({ userId }: { userId: string }): Promise<void> {
		const characters = await this.kobold.character.readManyLite({ userId });
		await Promise.all(
			characters.map(c => this.recomputeAdjustedSheet({ sheetRecordId: c.sheetRecordId }))
		);
	}

	/**
	 * Fire-and-forget convenience — call after any write that changes
	 * a sheet_record's sheet, conditions, or related modifiers.
	 * Errors are logged but don't propagate.
	 */
	triggerRecompute(sheetRecordId: number): void {
		void this.recomputeAdjustedSheet({ sheetRecordId }).catch(e => {
			console.error('[AdjustedSheetService] Failed to recompute adjusted sheet:', e);
		});
	}

	/**
	 * Fire-and-forget convenience for user-wide modifier changes —
	 * recomputes ALL characters for the user.
	 */
	triggerRecomputeAllForUser(userId: string): void {
		void this.recomputeAllForUser({ userId }).catch(e => {
			console.error(
				'[AdjustedSheetService] Failed to recompute adjusted sheets for user:',
				e
			);
		});
	}
}
