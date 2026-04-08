import { Kysely, sql } from 'kysely';

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
