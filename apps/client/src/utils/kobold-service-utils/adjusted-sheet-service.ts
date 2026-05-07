import { Kobold } from '@kobold/db';
import { SheetUtils } from '@kobold/sheet';
import { CommandTimingContext } from '../../services/command-timing-context.js';
import { Logger } from '../../services/logger.js';

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
	 * Fire-and-forget convenience — call after any write that changes
	 * a sheet_record's sheet, conditions, or related modifiers.
	 * Errors are logged but don't propagate.
	 */
	triggerRecompute(sheetRecordId: number): void {
		const start = Date.now();
		void CommandTimingContext.runOutside(async () => {
			await this.recomputeAdjustedSheet({ sheetRecordId });
			Logger.info(
				`adjusted_sheet recompute completed in ${Date.now() - start}ms`,
				{ sheetRecordId }
			);
		}).catch(e => {
			Logger.error(
				`adjusted_sheet recompute failed after ${Date.now() - start}ms`,
				{ sheetRecordId, error: e }
			);
		});
	}
}
