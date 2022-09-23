import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	return knex.schema.createTable('character', function (table) {
		table.increments('id', { primaryKey: true });
		table.text('user_id');
		table.integer('char_id');
		table.boolean('is_active_character').defaultTo(true);

		table.jsonb('character_data').defaultTo({});
		table.jsonb('calculated_stats').defaultTo({});

		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());

		table.unique(['user_id', 'char_id']);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTableIfExists('character');
}
