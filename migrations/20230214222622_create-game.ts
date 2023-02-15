import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('game', function (table) {
		table.increments('id', { primaryKey: true });
		table.text('gm_user_id').notNullable();
		table.text('name');
		table.text('server_id');

		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());
	});
	await knex.schema.createTable('users_in_games', function (table) {
		table.text('game_id').notNullable().references('game.id').onDelete('cascade');
		table.jsonb('character_id').notNullable().references('character.id').onDelete('cascade');

		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('game');
}
