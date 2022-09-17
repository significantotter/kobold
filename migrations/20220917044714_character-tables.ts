import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	knex.schema.createTable('character_data', function (table) {
		table.text('user_id');
		table.integer('char_id');
		table.unique(['user_id', 'char_id']);
		table.jsonb('basic_data');
		table.jsonb('metadata');
		table.jsonb('calculated_stats');
		table.jsonb('inventory');
		table.jsonb('conditions');
		table.integer('local_hp');
		table.integer('local_experience');
		table.integer('local_hero_points');
		table.integer('local_focus_points');
		table.jsonb('local_conditions');
		table.jsonb('local_spellbook');
		table.jsonb('local_spellslots');
	});
}

export async function down(knex: Knex): Promise<void> {}
