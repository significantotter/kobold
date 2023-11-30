import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('sheet_record')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('character_id', 'integer', col => col.references('character.id'))
		.addColumn('initiative_actor_id', 'integer', col => col.references('initiative_actor.id'))
		.addColumn('sheet', 'jsonb', col => col.notNull())
		.addColumn('modifiers', 'jsonb', col => col.defaultTo(sql`'[]'::JSONB`).notNull())
		.addColumn('actions', 'jsonb', col => col.defaultTo(sql`'[]'::JSONB`).notNull())
		.addColumn('roll_macros', 'jsonb', col => col.defaultTo(sql`'[]'::JSONB`).notNull())
		.addColumn('tracker_mode', 'text', col => col.defaultTo('counters_only'))
		.addColumn('tracker_message_id', 'text')
		.addColumn('tracker_channel_id', 'text')
		.addColumn('tracker_guild_id', 'text')
		.execute();

	// no way in native kysely to comment a column, so we have to do so manually
	await db.executeQuery(
		sql`COMMENT ON COLUMN "sheet_record"."sheet" IS '@type(Sheet, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
	await db.executeQuery(
		sql`COMMENT ON COLUMN "sheet_record"."modifiers" IS '@type(Modifiers, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
	await db.executeQuery(
		sql`COMMENT ON COLUMN "sheet_record"."actions" IS '@type(Actions, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
	await db.executeQuery(
		sql`COMMENT ON COLUMN "sheet_record"."roll_macros" IS '@type(RollMacros, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
	await db.executeQuery(
		sql`COMMENT ON COLUMN "sheet_record"."tracker_mode" IS '@type(SheetRecordTrackerModeEnum, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);

	// Move Character Actor Sheets to the new Sheet Table

	await db.schema
		.alterTable('character')
		.addColumn('sheet_record_id', 'integer', col =>
			col.references('sheet_record.id').onDelete('cascade')
		)
		.execute();

	await db.executeQuery(
		sql`
		WITH sheet_insert AS (
			INSERT INTO sheet_record (
				sheet,
				modifiers,
				actions,
				roll_macros,
				tracker_message_id,
				tracker_channel_id,
				tracker_guild_id,
				character_id
			)
			SELECT 
				sheet,
				modifiers,
				actions,
				roll_macros,
				tracker_message_id,
				tracker_channel_id,
				tracker_guild_id,
				character.id
			FROM character
			RETURNING id AS sheet_record_id, character_id
		)
		UPDATE character
		SET sheet_record_id = sheet_insert.sheet_record_id
		FROM sheet_insert
		WHERE character.id = sheet_insert.character_id
	`.compile(db)
	);

	await db.schema
		.alterTable('character')
		.dropColumn('sheet')
		.dropColumn('tracker_message_id')
		.dropColumn('tracker_channel_id')
		.dropColumn('tracker_guild_id')
		.dropColumn('tracker_mode')
		.dropColumn('modifiers')
		.dropColumn('actions')
		.dropColumn('roll_macros')
		.alterColumn('sheet_record_id', col => col.setNotNull())
		.execute();

	// Move Initiative Actor Sheets to the new Sheet Table

	await db.schema
		.alterTable('initiative_actor')
		.addColumn('sheet_record_id', 'integer', col =>
			col.references('sheet_record.id').onDelete('cascade')
		)
		.execute();

	await db.executeQuery(
		sql`
		WITH sheet_insert AS (
			INSERT INTO sheet_record (
				sheet,
				initiative_actor_id
			)
			SELECT 
				sheet,
				initiative_actor.id
			FROM initiative_actor
			-- only insert initiative actors that don't have a character associated with them
			-- because we already moved those sheets in the previous query
			WHERE initiative_actor.character_id IS NULL
			RETURNING id AS sheet_record_id, initiative_actor_id
		)
		UPDATE initiative_actor
		SET sheet_record_id = sheet_insert.sheet_record_id
		FROM sheet_insert
		WHERE initiative_actor.id = sheet_insert.initiative_actor_id;


		UPDATE initiative_actor
		SET sheet_record_id = character.sheet_record_id
		FROM character
		WHERE initiative_actor.character_id = character.id;
		`.compile(db)
	);

	// now update any initiative actors that have a character associated with them
	// to use the character's sheet
	await db.executeQuery(
		sql`
		UPDATE initiative_actor
		SET sheet_record_id = character.sheet_record_id
		FROM character
		WHERE initiative_actor.character_id = character.id
		`.compile(db)
	);

	await db.schema
		.alterTable('initiative_actor')
		.dropColumn('sheet')
		.alterColumn('sheet_record_id', col => col.setNotNull())
		.execute();

	// Remove the temporary columns from the initiative_actor table.
	// These were just needed so the inserts could return the target id
	// of a table to update.
	// Joins happen on the sheet_record_id fk of character and initiative_actor now.
	await db.schema
		.alterTable('sheet_record')
		.dropColumn('character_id')
		.dropColumn('initiative_actor_id')
		.execute();

	// Additionally, bestiary creatures are moving to drizzle entirely
	await db.schema.dropTable('bestiary_files_loaded').execute();
	await db.schema.dropTable('npc').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('character')
		.addColumn('sheet', 'jsonb', col => col.notNull().defaultTo(sql`'{}'::JSONB`))
		.addColumn('modifiers', 'jsonb', col => col.defaultTo(sql`'[]'::JSONB`).notNull())
		.addColumn('actions', 'jsonb', col => col.defaultTo(sql`'[]'::JSONB`).notNull())
		.addColumn('roll_macros', 'jsonb', col => col.defaultTo(sql`'[]'::JSONB`).notNull())
		.addColumn('tracker_mode', 'text', col => col.defaultTo('counters_only'))
		.addColumn('tracker_message_id', 'text')
		.addColumn('tracker_channel_id', 'text')
		.addColumn('tracker_guild_id', 'text')
		.execute();

	await db
		.updateTable('character')
		.set(eb => ({
			sheet: eb.ref(`sheet_record.sheet`),
			modifiers: eb.ref(`sheet_record.modifiers`),
			actions: eb.ref(`sheet_record.actions`),
			roll_macros: eb.ref(`sheet_record.roll_macros`),
			tracker_mode: eb.ref(`sheet_record.tracker_mode`),
			tracker_message_id: eb.ref(`sheet_record.tracker_message_id`),
			tracker_channel_id: eb.ref(`sheet_record.tracker_channel_id`),
			tracker_guild_id: eb.ref(`sheet_record.tracker_guild_id`),
		}))
		.from('sheet_record')
		.whereRef(`sheet_record.id`, '=', 'sheet_record_id')
		.execute();

	await db.schema
		.alterTable('initiative_actor')
		.addColumn('sheet', 'jsonb', col => col.notNull().defaultTo(sql`'{}'::JSONB`))
		.execute();

	await db
		.updateTable('initiative_actor')
		.set(eb => ({
			sheet: eb.ref(`sheet_record.sheet`),
		}))
		.from('sheet_record')
		.whereRef(`sheet_record.id`, '=', 'sheet_record_id')
		.execute();

	await db.schema.alterTable('initiative_actor').dropColumn('sheet_record_id').execute();
	await db.schema.alterTable('character').dropColumn('sheet_record_id').execute();

	await db.schema.dropTable('sheet_record').execute();

	await db.executeQuery(
		sql`COMMENT ON COLUMN "character"."sheet" IS '@type(Sheet, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
	await db.executeQuery(
		sql`COMMENT ON COLUMN "character"."modifiers" IS '@type(Modifiers, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
	await db.executeQuery(
		sql`COMMENT ON COLUMN "character"."actions" IS '@type(Actions, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
	await db.executeQuery(
		sql`COMMENT ON COLUMN "character"."roll_macros" IS '@type(RollMacros, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
	await db.executeQuery(
		sql`COMMENT ON COLUMN "initiative_actor"."sheet" IS '@type(Sheet, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);

	await db.schema
		.createTable('bestiary_files_loaded')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('file_name', 'text', col => col.notNull())
		.addColumn('file_hash', 'text', col => col.notNull())
		.addColumn('created_at', 'timestamptz', col =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
		)
		.addColumn('last_updated_at', 'timestamptz', col =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
		)
		.execute();

	await db.schema
		.createTable('npc')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('data', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`).notNull())
		.addColumn('fluff', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`).notNull())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('source_file_name', 'text', col => col.notNull())
		.addColumn('created_at', 'timestamptz', col =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
		)
		.addColumn('last_updated_at', 'timestamptz', col =>
			col.defaultTo(sql`CURRENT_TIMESTAMP`).notNull()
		)
		.execute();
}
