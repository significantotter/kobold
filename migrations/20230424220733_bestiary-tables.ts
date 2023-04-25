import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('bestiary_files_loaded', function (table) {
		table.increments('id', { primaryKey: true });
		table.text('file_name');
		table.text('file_hash');
		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());
	});
	await knex.schema.createTable('creature', function (table) {
		table.increments('id', { primaryKey: true });
		table.jsonb('data').defaultTo({});
		table.text('name').index('creature_name_index');
		table.text('source_file_name').index('source_file_name_index');
		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('bestiary_files_loaded');
	await knex.schema.dropTableIfExists('creature');
}
