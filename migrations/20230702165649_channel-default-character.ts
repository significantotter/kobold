import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('channel_default_character', function (table) {
		table.string('user_id').notNullable();
		table.integer('character_id').notNullable().references('character.id').onDelete('Cascade');
		table.string('channel_id').notNullable();
		table.primary(['user_id', 'channel_id']);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('channel_default_character');
}
