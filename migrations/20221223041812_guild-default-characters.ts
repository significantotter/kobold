import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('guild_default_character', function (table) {
		table.string('user_id').notNullable();
		table.integer('character_id').notNullable().references('character.id').onDelete('Cascade');
		table.string('guild_id').notNullable();
		table.primary(['user_id', 'guild_id']);
	});
}

export async function down(knex: Knex): Promise<void> {
	return knex.schema.dropTable('guild_default_character');
}
