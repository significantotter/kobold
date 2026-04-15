import { Kysely, sql } from 'kysely';

/**
 * Phase 1: Add adjusted_sheet as nullable.
 *
 * After running this migration, execute the backfill script to compute
 * adjusted_sheet for every existing row:
 *
 *   npx tsx apps/client/src/scripts/backfill-adjusted-sheets.ts
 *
 * Then run the next migration (2026-04-10-adjusted-sheet-not-null) to
 * enforce NOT NULL.
 */
export async function up(db: Kysely<any>): Promise<void> {
	await sql`
		ALTER TABLE public."sheet_record"
		ADD COLUMN "adjusted_sheet" jsonb
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`
		ALTER TABLE public."sheet_record"
		DROP COLUMN IF EXISTS "adjusted_sheet"
	`.execute(db);
}
