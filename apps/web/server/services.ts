import { Config } from '@kobold/config';
import { Kobold, getDialectWithPool } from '@kobold/db';

const { dialect, pool } = getDialectWithPool(Config.database.url);

export const kobold = new Kobold(dialect, {
	onQuery(event) {
		if (event.level === 'error') {
			console.error('[web db query error]', {
				durationMs: event.queryDurationMillis,
				sql: event.query.sql,
				parameters: event.query.parameters,
			});
			return;
		}

		if (event.queryDurationMillis >= 1_000) {
			console.warn('[web db slow query]', {
				durationMs: event.queryDurationMillis,
				sql: event.query.sql,
				parameters: event.query.parameters,
				pool: {
					total: pool.totalCount,
					idle: pool.idleCount,
					waiting: pool.waitingCount,
				},
			});
		}
	},
});

pool.on('error', err => console.error('[web pg pool idle client error]', err));
pool.on('connect', () => {
	if (pool.waitingCount > 0) {
		console.warn('[web pg pool connect while queries waiting]', {
			total: pool.totalCount,
			idle: pool.idleCount,
			waiting: pool.waitingCount,
		});
	}
});
