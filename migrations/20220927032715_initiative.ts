import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('initiative', function (table) {
		table.increments('id', { primaryKey: true });
		table.text('channel_id').notNullable().unique();
		table.text('gm_user_id').notNullable();
		table.jsonb('round_message_ids');
		table.integer('current_round').defaultTo(0).notNullable();
		table.integer('current_group_turn');

		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());
	});
	await knex.schema.createTable('initiative_actor_group', function (table) {
		table.increments('id', { primaryKey: true });
		table
			.integer('initiative_id')
			.notNullable()
			.references('initiative.id')
			.onDelete('cascade');
		table.text('user_id').notNullable();
		table.text('name').notNullable();
		table.integer('initiative_result').notNullable();

		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());
	});
	await knex.schema.createTable('initiative_actor', function (table) {
		table.increments('id', { primaryKey: true });
		table
			.integer('initiative_id')
			.notNullable()
			.references('initiative.id')
			.onDelete('cascade');
		table
			.integer('initiative_actor_group_id')
			.notNullable()
			.references('initiative_actor_group.id')
			.onDelete('cascade');
		table.integer('character_id').references('character.id');
		table.text('user_id').notNullable();
		table.text('name').notNullable();

		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('initiative_actor');
	await knex.schema.dropTableIfExists('initiative_actor_group');
	await knex.schema.dropTableIfExists('initiative');
}
