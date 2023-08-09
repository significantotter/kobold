/* eslint-disable camelcase */
import { format } from 'date-fns';
import Knex from 'knex';
import type { Knex as KnexType } from 'knex';
import { knexSnakeCaseMappers, Model } from 'objection';
import pg from 'pg';

export class DBModel {
	static knex: KnexType;

	static init(databaseUrl: string, pool_size_min: number = 2, pool_size_max: number = 10): void {
		DBModel.knex = Knex.default({
			client: 'postgresql',
			connection: databaseUrl,
			pool: {
				min: pool_size_min,
				max: pool_size_max,
			},
			...knexSnakeCaseMappers(),
		});
		Model.knex(DBModel.knex);
	}

	static destroy(): void {
		DBModel.knex.destroy();
	}
}

// Globally turn of automatic date parsing from PG
function parseDateTime(val: string): string {
	/* TODO, this introduces a lot of extra conversions.
	 * The JSON-Schema->class interface currently only knows to convert date-time to string type, not Date type
	 * Additionally, postgres strings format as `2021-02-05 19:29:38.362+00` but javascript formats as `2021-02-05T19:29:38.362Z`
	 * Solutions:
	 * 1) fix JSON Schema class interface to reconize date-strings as Date types
	 * 2) fix either Postgres or Javascript to the other type.
	 */

	if (val === null) return null;
	return new Date(val).toISOString();
}

function parseDate(val: string): string {
	if (val === null) return null;
	return format(new Date(val), 'YYYY-MM-DD');
}

pg.types.setTypeParser(pg.types.builtins.TIMESTAMPTZ, val => parseDateTime(val));
pg.types.setTypeParser(pg.types.builtins.TIMESTAMP, val => parseDateTime(val));
pg.types.setTypeParser(pg.types.builtins.DATE, val => parseDate(val));
pg.types.setTypeParser(pg.types.builtins.NUMERIC, val => parseFloat(val));

// Convert bitInts to js number
pg.types.setTypeParser(pg.types.builtins.INT8, parseInt);
