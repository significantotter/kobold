import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Ensure all minions have a sheet_record_id before making it required
	// For any minion without a sheet_record_id, create one from their sheet column
	await db.executeQuery(
		sql`
		INSERT INTO sheet_record (sheet)
		SELECT sheet FROM minion WHERE sheet_record_id IS NULL
		RETURNING id
	`.compile(db)
	);

	// Update minions to reference the new sheet records
	await db.executeQuery(
		sql`
		UPDATE minion
		SET sheet_record_id = (
			SELECT sr.id FROM sheet_record sr
			WHERE sr.sheet = minion.sheet
			AND minion.sheet_record_id IS NULL
			LIMIT 1
		)
		WHERE sheet_record_id IS NULL
	`.compile(db)
	);

	// Now make sheet_record_id NOT NULL
	await db.schema
		.alterTable('minion')
		.alterColumn('sheet_record_id', col => col.setNotNull())
		.execute();

	// Drop the sheet column - data now lives in sheet_record
	await db.schema.alterTable('minion').dropColumn('sheet').execute();

	// Remove initiative actors that reference deleted minions (cleanup orphans)
	await db.executeQuery(
		sql`
		DELETE FROM initiative_actor
		WHERE minion_id IS NOT NULL
		AND minion_id NOT IN (SELECT id FROM minion)
	`.compile(db)
	);
}

export async function down(db: Kysely<any>): Promise<void> {
	// Add the sheet column back
	await db.schema
		.alterTable('minion')
		.addColumn('sheet', 'jsonb', col => col.notNull().defaultTo(sql`'{}'::JSONB`))
		.execute();

	// Copy sheet data from sheet_record back to minion.sheet
	await db.executeQuery(
		sql`
		UPDATE minion
		SET sheet = (
			SELECT sr.sheet FROM sheet_record sr
			WHERE sr.id = minion.sheet_record_id
		)
	`.compile(db)
	);

	// Make sheet_record_id nullable again
	await db.schema
		.alterTable('minion')
		.alterColumn('sheet_record_id', col => col.dropNotNull())
		.execute();
}
