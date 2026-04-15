/**
 * One-time backfill script: computes adjusted_sheet for all existing sheet_records.
 *
 * Usage:
 *   npx tsx apps/client/src/scripts/backfill-adjusted-sheets.ts
 *
 * Safe to re-run — only processes records where adjusted_sheet IS NULL.
 */
import { Kobold, getDialect } from '@kobold/db';
import { Config } from '@kobold/config';
import { SheetUtils } from '../utils/sheet/sheet-utils.js';
import { sqlJSON } from '@kobold/db';

const BATCH_SIZE = 50;

async function main() {
	const dialect = getDialect(Config.database.url);
	const kobold = new Kobold(dialect);

	// Count records needing backfill
	const { count } = await kobold.db
		.selectFrom('sheetRecord')
		.select(eb => eb.fn.countAll<number>().as('count'))
		.where('adjustedSheet', 'is', null)
		.executeTakeFirstOrThrow();

	console.log(`[backfill] ${count} sheet_records need adjusted_sheet computation`);

	let processed = 0;

	while (processed < count) {
		// Fetch a batch of records without adjusted_sheet
		const records = await kobold.db
			.selectFrom('sheetRecord')
			.selectAll()
			.where('adjustedSheet', 'is', null)
			.limit(BATCH_SIZE)
			.execute();

		if (records.length === 0) break;

		for (const record of records) {
			// Fetch modifiers for this sheet record
			const modifiers = await kobold.modifier.readManyBySheetRecordId({
				sheetRecordId: record.id,
			});

			const adjustedSheet = SheetUtils.adjustSheetWithModifiers(record.sheet, [
				...(record.conditions ?? []),
				...modifiers,
			]);

			await kobold.db
				.updateTable('sheetRecord')
				.set({ adjustedSheet: sqlJSON(adjustedSheet) })
				.where('id', '=', record.id)
				.execute();

			processed++;
		}

		console.log(`[backfill] Processed ${processed}/${count}`);
	}

	console.log(`[backfill] Done. ${processed} records updated.`);
	await kobold.db.destroy();
}

main().catch(e => {
	console.error('[backfill] Fatal error:', e);
	process.exit(1);
});
