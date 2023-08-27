import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('user_settings', table => {
		table.enum('inline_rolls_display', ['detailed', 'compact']).defaultTo('detailed');
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('user_settings', table => {
		table.dropColumn('inline_rolls_display');
	});
}
