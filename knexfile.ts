import 'ts-node/register';
import type { Knex } from 'knex';
import dotenv from 'dotenv';
dotenv.config();

// Update with your config settings.

const config = {
	development: {
		client: 'postgresql',
		connection: process.env.DATABASE_URL,
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: './migrations',
			extension: 'ts',
			loadExtensions: ['.ts'],
		},
	},

	TEST: {
		client: 'postgresql',
		connection: process.env.DATABASE_TEST_URL,
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
			directory: './migrations',
			extension: 'ts',
			loadExtensions: ['.ts'],
		},
	},
} satisfies Record<string, Knex.Config>;
export default config;
