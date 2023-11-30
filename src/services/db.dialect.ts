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
	return new PostgresDialect({
		pool: new pg.Pool({ connectionString: databaseUrl }),
	});
}
