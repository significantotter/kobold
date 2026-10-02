import { Config } from '@kobold/config';
import { Kobold, getDialectWithPool } from '@kobold/db';
import { logger } from './logging.js';

const { dialect, pool } = getDialectWithPool(Config.database.url, {
	onConnectionEvent(event) {
		if (event.err) logger.error('Postgres connection failed', event.err, { ...event });
		else if ((event.durationMs ?? 0) >= 1_000) {
			logger.warn('Slow Postgres connection acquisition', { ...event });
		}
	},
});

export const kobold = new Kobold(dialect, {
	onQuery(event) {
		if (event.level === 'error') {
			logger.error(`database query failed (${event.queryDurationMillis}ms)`, event.error, {
				durationMs: event.queryDurationMillis,
				sql: event.query.sql,
				parameters: event.query.parameters,
			});
			return;
		}

		if (event.queryDurationMillis >= 1_000) {
			logger.warn(`slow database query (${event.queryDurationMillis}ms)`, {
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

pool.on('connect', () => {
	if (pool.waitingCount > 0) {
		logger.warn('Postgres connected while queries were waiting', {
			pool: {
				total: pool.totalCount,
				idle: pool.idleCount,
				waiting: pool.waitingCount,
			},
		});
	}
});
