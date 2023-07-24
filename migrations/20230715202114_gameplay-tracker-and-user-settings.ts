import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('character', function (table) {
		table.string('tracker_message_id').nullable().defaultTo(null);
		table.string('tracker_channel_id').nullable().defaultTo(null);
		table.string('tracker_guild_id').nullable().defaultTo(null);
		table
			.enum('tracker_mode', ['counters_only', 'basic_stats', 'full_sheet'])
			.defaultTo('counters_only');
	});
	await knex.schema.createTable('user_settings', function (table) {
		table.string('user_id').notNullable().primary();
		table
			.enum('init_stats_notification', [
				'never',
				'every_turn',
				'every_round',
				'whenever_hidden',
			])
			.defaultTo('whenever_hidden');
		table.enum('roll_compact_mode', ['compact', 'normal']).defaultTo('normal');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('character', function (table) {
		table.dropColumns('tracker_message_id', 'tracker_channel_id', 'tracker_guild_id');
	});
	await knex.schema.dropTable('user_settings');
}
