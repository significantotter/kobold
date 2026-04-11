import pg from 'pg';
import { PostgresDialect } from 'kysely';
import { format } from 'date-fns';

function parseDate(val: string | null): string | null {
	if (val === null) return null;
	return format(new Date(val), 'YYYY-MM-DD');
}

pg.types.setTypeParser(pg.types.builtins.DATE, val => parseDate(val));
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, val => new Date(val));
pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, val => new Date(val));
pg.types.setTypeParser(pg.types.builtins.NUMERIC, val => parseFloat(val));

// Convert bitInts to js number
pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);

export function getDialect(databaseUrl: string) {
	const pool = new pg.Pool({
		connectionString: databaseUrl,
		max: 20,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 10_000,
	});
	return new PostgresDialect({ pool });
}

/**
 * Creates a dialect and also returns the underlying pg.Pool for observability.
 * Attach pool event listeners ('connect', 'acquire', 'error') to monitor
 * connection usage and diagnose pool-saturation issues.
 */
export function getDialectWithPool(databaseUrl: string) {
	const pool = new pg.Pool({
		connectionString: databaseUrl,
		max: 20,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 10_000,
	});
	return { dialect: new PostgresDialect({ pool }), pool };
}
