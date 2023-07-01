import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.alterTable('initiative_actor', function (table) {
		table.boolean('hide_stats').notNullable().defaultTo(false);
	});
	await knex('initiative_actor').update({
		hide_stats: knex.raw(
			'CASE WHEN initiative_actor.character_id IS NULL THEN true ELSE false END'
		),
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('initiative_actor', function (table) {
		table.dropColumn('hide_stats');
	});
}
