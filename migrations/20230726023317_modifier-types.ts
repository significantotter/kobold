import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	await knex.raw(`
    UPDATE Character
    SET modifiers = COALESCE((
        SELECT jsonb_agg(
            jsonb_set(elems, '{modifierType}', '"roll"'::JSONB)
        )
        FROM jsonb_array_elements(modifiers) elems
    ), '[]'::JSONB);`);
	await knex.raw(`
    UPDATE Character
    SET modifiers = COALESCE((
        SELECT jsonb_agg(
            jsonb_set(elems, '{sheetAdjustments}', 'null'::JSONB)
        )
        FROM jsonb_array_elements(modifiers) elems
    ), '[]'::JSONB);`);
}

export async function down(knex: Knex): Promise<void> {
	await knex.raw(`
    UPDATE Character
    SET modifiers = COALESCE((
        SELECT jsonb_agg(
            elems - 'modifierType'
        )
        FROM jsonb_array_elements(modifiers) elems
    ), '[]'::JSONB);`);
	await knex.raw(`
    UPDATE Character
    SET modifiers = COALESCE((
        SELECT jsonb_agg(
            elems - 'sheetAdjustments'
        )
        FROM jsonb_array_elements(modifiers) elems
    ), '[]'::JSONB);`);
}
