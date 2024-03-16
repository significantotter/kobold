import { Kysely } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	db.schema
		.alterTable('initiative_actor')
		.addColumn('note', 'text', eb => eb.notNull().defaultTo(''))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	db.schema.alterTable('initiative_actor').dropColumn('note').execute();
}
