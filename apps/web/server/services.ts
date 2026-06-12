import { Config } from '@kobold/config';
import { Kobold, getDialectWithPool } from '@kobold/db';
import { logger } from './logging.js';

const { dialect, pool } = getDialectWithPool(Config.database.url);

export const kobold = new Kobold(dialect, {
	onQuery(event) {
		if (event.level === 'error') {
			logger.error(
				`database query failed (${event.queryDurationMillis}ms)`,
				undefined,
				{
					durationMs: event.queryDurationMillis,
					sql: event.query.sql,
					parameters: event.query.parameters,
				}
			);
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

pool.on('error', err => logger.error('Postgres idle client error', err));
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
