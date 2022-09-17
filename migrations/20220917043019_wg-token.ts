import { Knex } from 'knex';

export async function up(knex: Knex): Promise<void> {
	// we only use raw here since I already have these exact auth tokens
	// built before developing this app. From here on, schema changes happen through knex migrations
	return knex.schema.raw(
		`-- sql
		CREATE TABLE IF NOT EXISTS wg_auth_token(
			id SERIAL PRIMARY KEY,
			char_id INTEGER NOT NULL,
			access_token TEXT NOT NULL,
			expires_at TIMESTAMP NOT NULL,
			access_rights TEXT NOT NULL,
			token_type TEXT NOT NULL
		);
		`
	);
}

export async function down(knex: Knex): Promise<void> {}
