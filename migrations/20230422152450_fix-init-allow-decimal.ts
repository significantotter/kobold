import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('initiative_actor_group', function (table) {
		table.decimal('initiative_result').notNullable().alter();
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('initiative_actor_group', function (table) {
		table.integer('initiative_result').notNullable().alter();
	});
}
