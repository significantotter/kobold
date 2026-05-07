import { Kysely, sql } from 'kysely';

/**
 * Phase 2: enforce cached adjusted sheets.
 *
 * This migration intentionally fails before ALTER TABLE if any rows still need
 * the backfill. Run apps/client/src/scripts/backfill-adjusted-sheets.ts first.
 */
export async function up(db: Kysely<any>): Promise<void> {
	const result = await sql<{ count: string }>`
		SELECT COUNT(*) AS count
		FROM public."sheet_record"
		WHERE "adjusted_sheet" IS NULL
	`.execute(db);
	const nullCount = Number(result.rows[0]?.count ?? 0);
	if (nullCount > 0) {
		throw new Error(
			`Cannot make sheet_record.adjusted_sheet NOT NULL: ${nullCount} rows are still NULL. Run the adjusted sheet backfill first.`
		);
	}

	await sql`
		ALTER TABLE public."sheet_record"
		ALTER COLUMN "adjusted_sheet" SET NOT NULL
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`
		ALTER TABLE public."sheet_record"
		ALTER COLUMN "adjusted_sheet" DROP NOT NULL
	`.execute(db);
}
