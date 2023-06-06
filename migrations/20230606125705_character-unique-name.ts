import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.raw(`
        UPDATE character t
        set name = CASE WHEN row_num = 1 THEN t.name ELSE t.name || ' (' || row_num || ')' END
        from (
            select *, row_number() over (partition by character.name order by character.name) row_num
            from character
        ) w
        where w.row_num > 1
        and w.id = t.id
    `);
	await knex.schema.alterTable('character', function (table) {
		table.dropUnique(['user_id', 'char_id']);
	});
}

export async function down(knex: Knex): Promise<void> {
	await knex.schema.alterTable('character', function (table) {
		table.unique(['user_id', 'char_id']);
	});
}
