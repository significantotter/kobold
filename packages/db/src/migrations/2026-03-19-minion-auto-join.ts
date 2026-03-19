import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	// Add auto_join_initiative column to minion table
	// Default true to preserve existing behavior (minions auto-join character's initiative group)
	await db.schema
		.alterTable('minion')
		.addColumn('auto_join_initiative', 'boolean', col => col.notNull().defaultTo(true))
		.execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema.alterTable('minion').dropColumn('auto_join_initiative').execute();
}
