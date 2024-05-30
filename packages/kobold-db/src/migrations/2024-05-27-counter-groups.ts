import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.executeQuery(
		sql` 
			UPDATE Sheet_Record
			SET sheet = sheet || jsonb_build_object('counterGroups', '[]'::jsonb) || jsonb_build_object('countersOutsideGroups', '[]'::jsonb);
		`.compile(db)
	);
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.executeQuery(
		sql`
			UPDATE Sheet_Record
			SET sheet = (sheet - 'counterGroups') - 'countersOutsideGroups';
		`.compile(db)
	);
}
