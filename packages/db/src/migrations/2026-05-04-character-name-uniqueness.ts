import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	const duplicates = await sql<{ user_id: string; normalized_name: string; count: string }>`
		SELECT user_id, lower(name) AS normalized_name, count(*) AS count
		FROM character
		GROUP BY user_id, lower(name)
		HAVING count(*) > 1
		LIMIT 1
	`.execute(db);

	if (duplicates.rows.length > 0) {
		const duplicate = duplicates.rows[0];
		throw new Error(
			`Cannot add character name uniqueness index; user ${duplicate.user_id} has ${duplicate.count} characters named "${duplicate.normalized_name}".`
		);
	}

	await sql`
		CREATE UNIQUE INDEX IF NOT EXISTS character_user_lower_name_unique
		ON character (user_id, lower(name))
	`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
	await sql`DROP INDEX IF EXISTS character_user_lower_name_unique`.execute(db);
}
