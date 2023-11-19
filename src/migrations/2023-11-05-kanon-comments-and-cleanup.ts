import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	await db.schema
		.alterTable('bestiary_files_loaded')
		.alterColumn('file_name', col => col.setNotNull())
		.alterColumn('file_hash', col => col.setNotNull())
		.alterColumn('created_at', col => col.setNotNull())
		.alterColumn('last_updated_at', col => col.setNotNull())
		.execute();

	await db.schema
		.alterTable('npc')
		.alterColumn('data', col => col.setNotNull())
		.alterColumn('fluff', col => col.setNotNull())
		.alterColumn('name', col => col.setNotNull())
		.alterColumn('source_file_name', col => col.setNotNull())
		.alterColumn('created_at', col => col.setNotNull())
		.alterColumn('last_updated_at', col => col.setNotNull())
		.execute();

	await db.schema
		.alterTable('user_settings')
		.alterColumn('user_id', col => col.setDataType('text'))
		.alterColumn('init_stats_notification', col => col.setNotNull())
		.alterColumn('roll_compact_mode', col => col.setNotNull())
		.alterColumn('inline_rolls_display', col => col.setNotNull())
		.execute();

	await db.schema
		.alterTable('game')
		.alterColumn('name', col => col.setNotNull())
		.alterColumn('created_at', col => col.setNotNull())
		.alterColumn('last_updated_at', col => col.setNotNull())
		.execute();

	await db.schema
		.alterTable('characters_in_games')
		.alterColumn('created_at', col => col.setNotNull())
		.alterColumn('last_updated_at', col => col.setNotNull())
		.execute();

	await db.schema
		.alterTable('character')
		.dropColumn('character_data')
		.dropColumn('calculated_stats')
		.dropColumn('attributes')
		.dropColumn('custom_attributes')
		.dropColumn('custom_actions')
		.alterColumn('user_id', col => col.setNotNull())
		.alterColumn('char_id', col => col.setNotNull())
		.alterColumn('is_active_character', col => col.setNotNull())
		.alterColumn('created_at', col => col.setNotNull())
		.alterColumn('last_updated_at', col => col.setNotNull())
		.alterColumn('sheet', col => col.setNotNull())
		.alterColumn('name', col => col.setNotNull())
		.alterColumn('import_source', col => col.setNotNull())
		.alterColumn('tracker_mode', col => col.setNotNull())
		.alterColumn('tracker_message_id', col => col.dropDefault())
		.alterColumn('tracker_channel_id', col => col.dropDefault())
		.alterColumn('tracker_guild_id', col => col.dropDefault())
		.alterColumn('tracker_message_id', col => col.setDataType('text'))
		.alterColumn('tracker_channel_id', col => col.setDataType('text'))
		.alterColumn('tracker_guild_id', col => col.setDataType('text'))
		.execute();

	// await db.schema.alterTable('wg_auth_token').execute();

	await db.schema
		.alterTable('initiative')
		.dropColumn('round_message_ids')
		.alterColumn('created_at', col => col.setNotNull())
		.alterColumn('last_updated_at', col => col.setNotNull())
		.execute();

	await db.schema
		.alterTable('initiative_actor_group')
		.alterColumn('created_at', col => col.setNotNull())
		.alterColumn('last_updated_at', col => col.setNotNull())
		.execute();

	await db.schema
		.alterTable('initiative_actor')
		.alterColumn('created_at', col => col.setNotNull())
		.alterColumn('last_updated_at', col => col.setNotNull())
		.alterColumn('sheet', col => col.setNotNull())
		.execute();

	await db.schema
		.alterTable('channel_default_character')
		.alterColumn('channel_id', col => col.setDataType('text'))
		.alterColumn('user_id', col => col.setDataType('text'))
		.execute();

	await db.schema
		.alterTable('guild_default_character')
		.alterColumn('user_id', col => col.setDataType('text'))
		.alterColumn('guild_id', col => col.setDataType('text'))
		.execute();

	// no way in native kysely to comment a column, so we have to do so manually
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
	await db.executeQuery(
		sql`COMMENT ON COLUMN "npc"."data" IS '@type(NpcData, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
	await db.executeQuery(
		sql`COMMENT ON COLUMN "npc"."fluff" IS '@type(NpcFluff, ''./../kanel-types'', true, false, true)'`.compile(
			db
		)
	);
}

export async function down(db: Kysely<any>): Promise<void> {
	// Migration code
	await db.schema
		.alterTable('bestiary_files_loaded')
		.alterColumn('file_name', col => col.dropNotNull())
		.alterColumn('file_hash', col => col.dropNotNull())
		.alterColumn('created_at', col => col.dropNotNull())
		.alterColumn('last_updated_at', col => col.dropNotNull())
		.execute();

	await db.schema
		.alterTable('npc')
		.alterColumn('data', col => col.dropNotNull())
		.alterColumn('fluff', col => col.dropNotNull())
		.alterColumn('name', col => col.dropNotNull())
		.alterColumn('source_file_name', col => col.dropNotNull())
		.alterColumn('created_at', col => col.dropNotNull())
		.alterColumn('last_updated_at', col => col.dropNotNull())
		.execute();

	await db.schema
		.alterTable('user_settings')
		.alterColumn('user_id', col => col.setDataType('varchar(255)'))
		.alterColumn('init_stats_notification', col => col.dropNotNull())
		.alterColumn('roll_compact_mode', col => col.dropNotNull())
		.alterColumn('inline_rolls_display', col => col.dropNotNull())
		.execute();

	await db.schema
		.alterTable('game')
		.alterColumn('name', col => col.dropNotNull())
		.alterColumn('created_at', col => col.dropNotNull())
		.alterColumn('last_updated_at', col => col.dropNotNull())
		.execute();

	await db.schema
		.alterTable('characters_in_games')
		.alterColumn('created_at', col => col.dropNotNull())
		.alterColumn('last_updated_at', col => col.dropNotNull())
		.execute();

	await db.schema
		.alterTable('character')
		.addColumn('character_data', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`))
		.addColumn('calculated_stats', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`))
		.addColumn('attributes', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
		.addColumn('custom_attributes', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
		.addColumn('custom_actions', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
		.alterColumn('user_id', col => col.dropNotNull())
		.alterColumn('char_id', col => col.dropNotNull())
		.alterColumn('is_active_character', col => col.dropNotNull())
		.alterColumn('created_at', col => col.dropNotNull())
		.alterColumn('last_updated_at', col => col.dropNotNull())
		.alterColumn('sheet', col => col.dropNotNull())
		.alterColumn('name', col => col.dropNotNull())
		.alterColumn('import_source', col => col.dropNotNull())
		.alterColumn('tracker_mode', col => col.dropNotNull())
		.alterColumn('tracker_message_id', col => col.setDefault(`NULL`))
		.alterColumn('tracker_channel_id', col => col.setDefault(`NULL`))
		.alterColumn('tracker_guild_id', col => col.setDefault(`NULL`))
		.alterColumn('tracker_message_id', col => col.setDataType('varchar(255)'))
		.alterColumn('tracker_channel_id', col => col.setDataType('varchar(255)'))
		.alterColumn('tracker_guild_id', col => col.setDataType('varchar(255)'))
		.execute();

	await db.schema
		.alterTable('initiative')
		.addColumn('round_message_ids', 'jsonb')
		.alterColumn('created_at', col => col.dropNotNull())
		.alterColumn('last_updated_at', col => col.dropNotNull())
		.execute();

	await db.schema
		.alterTable('initiative_actor_group')
		.alterColumn('initiative_result', col => col.setDataType('numeric(20, 2)'))
		.alterColumn('created_at', col => col.dropNotNull())
		.alterColumn('last_updated_at', col => col.dropNotNull())
		.execute();

	await db.schema
		.alterTable('initiative_actor')
		.alterColumn('created_at', col => col.dropNotNull())
		.alterColumn('last_updated_at', col => col.dropNotNull())
		.alterColumn('sheet', col => col.dropNotNull())
		.execute();

	await db.schema
		.alterTable('channel_default_character')
		.alterColumn('channel_id', col => col.setDataType('varchar(255)'))
		.execute();

	await db.schema
		.alterTable('guild_default_character')
		.alterColumn('user_id', col => col.setDataType('varchar(255)'))
		.alterColumn('guild_id', col => col.setDataType('varchar(255)'))
		.execute();

	// no way in native kysely to comment a column, so we have to do so manually
	await db.executeQuery(sql`COMMENT ON COLUMN "character"."sheet" IS NULL`.compile(db));
	await db.executeQuery(sql`COMMENT ON COLUMN "character"."modifiers" IS NULL`.compile(db));
	await db.executeQuery(sql`COMMENT ON COLUMN "character"."actions" IS NULL`.compile(db));
	await db.executeQuery(sql`COMMENT ON COLUMN "character"."roll_macros" IS NULL`.compile(db));
	await db.executeQuery(sql`COMMENT ON COLUMN "initiative_actor"."sheet" IS NULL`.compile(db));
	await db.executeQuery(sql`COMMENT ON COLUMN "npc"."data" IS NULL`.compile(db));
	await db.executeQuery(sql`COMMENT ON COLUMN "npc"."fluff" IS NULL`.compile(db));
}
