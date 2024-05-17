import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	db.schema
		.alterTable('user_settings')
		.addColumn('default_compendium', 'text', eb => eb.notNull().defaultTo('nethys'))
		.execute();

	await db.executeQuery(
		sql`
			COMMENT ON COLUMN "user_settings"."default_compendium" IS '@type(DefaultCompendiumEnum, ''./../kanel-types'', true, false, true)';
		`.compile(db)
	);
}

export async function down(db: Kysely<any>): Promise<void> {
	db.schema.alterTable('user_settings').dropColumn('default_compendium').execute();
}
