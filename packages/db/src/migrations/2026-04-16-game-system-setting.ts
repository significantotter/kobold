import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// user_settings: add game_system column
	await db.schema
		.alterTable('user_settings')
		.addColumn('game_system', 'text', eb => eb.notNull().defaultTo('pf2e'))
		.execute();

	// nethys_compendium: add game_system column + swap unique constraints to composites
	await db.schema
		.alterTable('nethys_compendium')
		.addColumn('game_system', 'text', eb => eb.notNull().defaultTo('pf2e'))
		.execute();
	await sql`ALTER TABLE "nethys_compendium" DROP CONSTRAINT IF EXISTS "nethys_compendium_elastic_id_unique"`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_compendium" DROP CONSTRAINT IF EXISTS "nethys_compendium_nethys_id_unique"`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_compendium" ADD CONSTRAINT "nethys_compendium_game_system_elastic_id_unique" UNIQUE("game_system","elastic_id")`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_compendium" ADD CONSTRAINT "nethys_compendium_game_system_nethys_id_unique" UNIQUE("game_system","nethys_id")`.execute(
		db
	);

	// nethys_bestiary: add game_system column + swap unique constraints to composites
	await db.schema
		.alterTable('nethys_bestiary')
		.addColumn('game_system', 'text', eb => eb.notNull().defaultTo('pf2e'))
		.execute();
	await sql`ALTER TABLE "nethys_bestiary" DROP CONSTRAINT IF EXISTS "nethys_bestiary_elastic_id_unique"`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_bestiary" DROP CONSTRAINT IF EXISTS "nethys_bestiary_nethys_id_unique"`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_bestiary" ADD CONSTRAINT "nethys_bestiary_game_system_elastic_id_unique" UNIQUE("game_system","elastic_id")`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_bestiary" ADD CONSTRAINT "nethys_bestiary_game_system_nethys_id_unique" UNIQUE("game_system","nethys_id")`.execute(
		db
	);
}

export async function down(db: Kysely<any>): Promise<void> {
	// Revert user_settings
	await db.schema.alterTable('user_settings').dropColumn('game_system').execute();

	// Revert nethys_compendium
	await sql`ALTER TABLE "nethys_compendium" DROP CONSTRAINT IF EXISTS "nethys_compendium_game_system_elastic_id_unique"`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_compendium" DROP CONSTRAINT IF EXISTS "nethys_compendium_game_system_nethys_id_unique"`.execute(
		db
	);
	await db.schema.alterTable('nethys_compendium').dropColumn('game_system').execute();
	await sql`ALTER TABLE "nethys_compendium" ADD CONSTRAINT "nethys_compendium_elastic_id_unique" UNIQUE("elastic_id")`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_compendium" ADD CONSTRAINT "nethys_compendium_nethys_id_unique" UNIQUE("nethys_id")`.execute(
		db
	);

	// Revert nethys_bestiary
	await sql`ALTER TABLE "nethys_bestiary" DROP CONSTRAINT IF EXISTS "nethys_bestiary_game_system_elastic_id_unique"`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_bestiary" DROP CONSTRAINT IF EXISTS "nethys_bestiary_game_system_nethys_id_unique"`.execute(
		db
	);
	await db.schema.alterTable('nethys_bestiary').dropColumn('game_system').execute();
	await sql`ALTER TABLE "nethys_bestiary" ADD CONSTRAINT "nethys_bestiary_elastic_id_unique" UNIQUE("elastic_id")`.execute(
		db
	);
	await sql`ALTER TABLE "nethys_bestiary" ADD CONSTRAINT "nethys_bestiary_nethys_id_unique" UNIQUE("nethys_id")`.execute(
		db
	);
}
