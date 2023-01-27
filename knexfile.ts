import type { Knex } from 'knex';
import { Config } from './src/config/config.js';

// Update with your config settings.

const config: { [key: string]: Knex.Config } = {
	development: {
		client: 'postgresql',
		connection: Config.database.url,
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
		},
	},

	TEST: {
		client: 'postgresql',
		connection: Config.database.testUrl,
		pool: {
			min: 2,
			max: 10,
		},
		migrations: {
			tableName: 'knex_migrations',
		},
	},
};

module.exports = config;
