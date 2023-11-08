import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	const tables = await db.introspection.getTables();

	// if we have the schema from past Knex migrations, don't run the initial migration
	if (tables.map(table => table.name).includes('user_settings')) return;

	await db.schema
		.createTable('bestiary_files_loaded')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('file_name', 'text')
		.addColumn('file_hash', 'text')
		.addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('last_updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();

	await db.schema
		.createTable('npc')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('data', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`))
		.addColumn('fluff', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`))
		.addColumn('name', 'text')
		.addColumn('source_file_name', 'text')
		.addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('last_updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();

	await db.schema
		.createTable('user_settings')
		.addColumn('user_id', 'varchar(255)', col => col.primaryKey().notNull())
		.addColumn('init_stats_notification', 'text', col => col.defaultTo(sql`'whenever_hidden'`))
		.addColumn('roll_compact_mode', 'text', col => col.defaultTo(sql`'normal'`))
		.addColumn('inline_rolls_display', 'text', col => col.defaultTo(sql`'detailed'`))
		.execute();

	await db.schema
		.createTable('game')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('gm_user_id', 'text', col => col.notNull())
		.addColumn('name', 'text')
		.addColumn('guild_id', 'text', col => col.notNull())
		.addColumn('is_active', 'boolean', col => col.defaultTo(sql`false`).notNull())
		.addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('last_updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addUniqueConstraint('game_name_guild_id_unique', ['name', 'guild_id'])
		.execute();

	await db.schema
		.createTable('characters_in_games')
		.addColumn('game_id', 'integer', col =>
			col.notNull().references('game.id').onDelete('cascade')
		)
		.addColumn('character_id', 'integer', col =>
			col.notNull().references('character.id').onDelete('cascade')
		)
		.addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('last_updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();

	await db.schema
		.createTable('character')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('user_id', 'text')
		.addColumn('char_id', 'integer')
		.addColumn('is_active_character', 'boolean', col => col.defaultTo(sql`true`))
		.addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('last_updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('modifiers', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
		.addColumn('actions', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
		.addColumn('roll_macros', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
		.addColumn('sheet', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`))
		.addColumn('name', 'varchar(255)')
		.addColumn('import_source', 'varchar(255)', col => col.defaultTo(sql`'wg'`))
		.addColumn('tracker_message_id', 'varchar(255)', col => col.defaultTo(sql`NULL`))
		.addColumn('tracker_channel_id', 'varchar(255)', col => col.defaultTo(sql`NULL`))
		.addColumn('tracker_guild_id', 'varchar(255)', col => col.defaultTo(sql`NULL`))
		.addColumn('tracker_mode', 'text', col => col.defaultTo(sql`'counters_only'`))
		.addColumn('character_data', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`))
		.addColumn('calculated_stats', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`))
		.addColumn('attributes', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
		.addColumn('custom_attributes', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
		.addColumn('custom_actions', 'jsonb', col => col.defaultTo(sql`'[]'::jsonb`).notNull())
		.execute();

	await db.schema
		.createTable('wg_auth_token')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('char_id', 'integer', col => col.notNull())
		.addColumn('access_token', 'text', col => col.notNull())
		.addColumn('expires_at', 'timestamptz', col => col.notNull())
		.addColumn('access_rights', 'text', col => col.notNull())
		.addColumn('token_type', 'text', col => col.notNull())
		.execute();

	await db.schema
		.createTable('initiative')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('channel_id', 'text', col => col.notNull())
		.addColumn('gm_user_id', 'text', col => col.notNull())
		.addColumn('round_message_ids', 'jsonb')
		.addColumn('current_round', 'integer', col => col.defaultTo(sql`0`).notNull())
		.addColumn('current_turn_group_id', 'integer')
		.addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('last_updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addUniqueConstraint('initiative_channel_id_unique', ['channel_id'])

		.execute();

	await db.schema
		.createTable('initiative_actor_group')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('initiative_id', 'integer', col =>
			col.notNull().references('initiative.id').onDelete('cascade')
		)
		.addColumn('user_id', 'text', col => col.notNull())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('initiative_result', 'numeric(8, 2)', col => col.notNull())
		.addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('last_updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.execute();

	await db.schema
		.createTable('initiative_actor')
		.addColumn('id', 'serial', col => col.primaryKey().notNull())
		.addColumn('initiative_id', 'integer', col =>
			col.notNull().references('initiative.id').onDelete('cascade')
		)
		.addColumn('initiative_actor_group_id', 'integer', col =>
			col.notNull().references('initiative_actor_group.id').onDelete('cascade')
		)
		.addColumn('character_id', 'integer', col =>
			col.references('character.id').onDelete('set null')
		)
		.addColumn('user_id', 'text', col => col.notNull())
		.addColumn('name', 'text', col => col.notNull())
		.addColumn('created_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('last_updated_at', 'timestamptz', col => col.defaultTo(sql`CURRENT_TIMESTAMP`))
		.addColumn('sheet', 'jsonb', col => col.defaultTo(sql`'{}'::jsonb`))
		.addColumn('reference_npc_name', 'text')
		.addColumn('hide_stats', 'boolean', col => col.defaultTo(sql`false`).notNull())
		.execute();

	await db.schema
		.createTable('channel_default_character')
		.addColumn('user_id', 'varchar(255)', col => col.notNull())
		.addColumn('character_id', 'integer', col =>
			col.notNull().references('character.id').onDelete('cascade')
		)
		.addColumn('channel_id', 'varchar(255)', col => col.notNull())
		.addPrimaryKeyConstraint('channel_default_character_pkey', ['user_id', 'channel_id'])
		.execute();

	await db.schema
		.createTable('guild_default_character')
		.addColumn('user_id', 'varchar(255)', col => col.notNull())
		.addColumn('character_id', 'integer', col =>
			col.notNull().references('character.id').onDelete('cascade')
		)
		.addColumn('guild_id', 'varchar(255)', col => col.notNull())
		.addPrimaryKeyConstraint('guild_default_character_pkey', ['user_id', 'guild_id'])
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	// Migration code
}
