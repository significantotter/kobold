// Update with your config settings.
const Config = require('./config/config.json');

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
module.exports = {
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

	test: {
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
