import pg from 'pg';
import { PostgresDialect } from 'kysely';

export function getDialect(databaseUrl: string) {
	return new PostgresDialect({
		pool: new pg.Pool({ connectionString: databaseUrl }),
	});
}
