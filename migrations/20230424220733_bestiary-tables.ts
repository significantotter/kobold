import { Knex } from 'knex';
import { Creature } from '../dist/utils/creature.js';
import _ from 'lodash';
import { Character } from '../dist/services/kobold/models/index.js';

export async function up(knex: Knex): Promise<void> {
	await knex.schema.createTable('bestiary_files_loaded', function (table) {
		table.increments('id', { primaryKey: true });
		table.text('file_name');
		table.text('file_hash');
		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());
	});
	await knex.schema.createTable('npc', function (table) {
		table.increments('id', { primaryKey: true });
		table.jsonb('data').defaultTo({});
		table.jsonb('fluff').defaultTo({});
		table.text('name').index('npc_name_index');
		table.text('source_file_name').index('source_file_name_index');
		table.timestamp('created_at', { useTz: true }).defaultTo(knex.fn.now());
		table.timestamp('last_updated_at', { useTz: true }).defaultTo(knex.fn.now());
	});
	await knex.schema.alterTable('initiative_actor', function (table) {
		table.jsonb('sheet').defaultTo({});
		table.text('reference_npc_name');
	});
	await knex.schema.alterTable('character', function (table) {
		table.jsonb('sheet').defaultTo({});
		table.string('name');
		table.string('import_source').defaultTo('wg');
	});

	let [charactersCount, characters] = await Promise.all([
		knex('character').count('*', { as: 'count' }),
		knex('character').select('*').orderBy('id', 'asc').limit(1000).offset(0),
	]);
	let offset = 1000;
	while (characters.length) {
		const characterUpdates = characters.map(character => {
			const mappedChar = _.mapKeys(character, (value, key) => _.camelCase(key)) as Character;
			return { sheet: Creature.fromCharacter(mappedChar).sheet, id: character.id };
		});
		//perform and commit the batch attribute update
		const trx = await knex.transaction();
		await Promise.all([
			...characterUpdates.map(update => {
				return knex('character')
					.where('id', update.id)
					.update({ sheet: JSON.stringify(update.sheet), name: update.sheet.info.name })
					.transacting(trx);
			}),
			...characterUpdates.map(update => {
				return knex('initiative_actor')
					.where('character_id', update.id)
					.update({ sheet: JSON.stringify(update.sheet) })
					.transacting(trx);
			}),
		]);
		await trx.commit();

		//fetch the next page
		characters = await knex('character')
			.select('*')
			.orderBy('id', 'asc')
			.limit(1000)
			.offset(offset);
		offset += 1000;
	}
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.dropTableIfExists('bestiary_files_loaded');
	await knex.schema.dropTableIfExists('npc');
	await knex.schema.alterTable('initiative_actor', function (table) {
		table.dropColumn('sheet');
		table.dropColumn('reference_npc_name');
	});
	await knex.schema.alterTable('character', function (table) {
		table.dropColumn('sheet');
		table.dropColumn('name');
		table.dropColumn('import_source');
	});
}
