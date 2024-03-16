import { Kysely, sql } from 'kysely';

export async function up(db: Kysely<any>): Promise<void> {
	db.schema
		.alterTable('character')
		.addColumn('game_id', 'integer', col => col.references('game.id').onDelete('set null'))
		.execute();
	db.schema
		.alterTable('initiative_actor')
		.addColumn('game_id', 'integer', col => col.references('game.id').onDelete('set null'))
		.execute();
	db.executeQuery(
		sql`
			UPDATE character
			SET game_id = first_characters_in_games.game_id
			FROM character as inner_character 
			INNER JOIN (
				SELECT game_id, character_id FROM characters_in_games
			) as first_characters_in_games
			ON inner_character.id = first_characters_in_Games.character_id
			WHERE inner_character.id = character.id
	`.compile(db)
	);
	db.executeQuery(
		sql`
		UPDATE initiative_actor
		SET game_id = characters_in_games.game_id
		FROM characters_in_games
		WHERE characters_in_games.character_id = initiative_actor.character_id
		`.compile(db)
	);
	db.schema.dropTable('characters_in_games').execute();
}

export async function down(db: Kysely<any>): Promise<void> {
	await db.schema
		.createTable('characters_in_games')
		.addColumn('game_id', 'integer', col =>
			col.notNull().references('game.id').onDelete('cascade')
		)
		.addColumn('character_id', 'integer', col =>
			col.notNull().references('character.id').onDelete('cascade')
		)
		.addColumn('created_at', 'timestamptz', col =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addColumn('last_updated_at', 'timestamptz', col =>
			col.notNull().defaultTo(sql`CURRENT_TIMESTAMP`)
		)
		.addPrimaryKeyConstraint('characters_in_games_pkey', ['game_id', 'character_id'])
		.execute();
	db.executeQuery(
		sql`
		INSERT INTO characters_in_games (game_id, character_id)
		SELECT game_id, character.id
		FROM character
		WHERE character.game_id IS NOT NULL;
	`.compile(db)
	);
	db.schema.alterTable('character').dropColumn('game_id').execute();
	db.schema.alterTable('initiative_actor').dropColumn('game_id').execute();
}
