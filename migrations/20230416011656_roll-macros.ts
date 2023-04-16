import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('character', function (table) {
		table.jsonb('roll_macros').notNullable().defaultTo(JSON.stringify([]));
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.alterTable('character', function (table) {
		table.dropColumns('roll_macros');
	});
}
