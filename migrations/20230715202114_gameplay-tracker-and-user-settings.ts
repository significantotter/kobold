import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('character', function (table) {
		table.string('tracker_id').nullable().defaultTo(null);
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
		table.dropColumn('tracker_id');
	});
	await knex.schema.dropTable('user_settings');
}
