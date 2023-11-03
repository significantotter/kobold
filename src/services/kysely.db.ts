import { Pool } from 'pg';
import { PostgresDialect } from 'kysely';

export function getDialect() {
	return new PostgresDialect({
		pool: new Pool({
			database: 'test',
			host: 'localhost',
			user: 'admin',
			port: 5434,
			max: 10,
		}),
	});
}
