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

export interface DatabaseConnectionEvent {
	event: 'db_connection_error' | 'db_connection_acquired' | 'db_connection_acquire_failed';
	state?: 'idle' | 'checked-out';
	durationMs?: number;
	err?: { name: string; message: string; stack?: string; code?: string };
	pool: { total: number; idle: number; waiting: number };
}

export interface DatabaseConnectionOptions {
	onConnectionEvent?: (event: DatabaseConnectionEvent) => void | Promise<void>;
}

export function getDialect(databaseUrl: string, options: DatabaseConnectionOptions = {}) {
	return getDialectWithPool(databaseUrl, options).dialect;
}

/** Creates a protected pool; failed operations still reject and are never replayed. */
export function getDialectWithPool(databaseUrl: string, options: DatabaseConnectionOptions = {}) {
	const pool = new pg.Pool({
		connectionString: databaseUrl,
		max: 20,
		idleTimeoutMillis: 30_000,
		connectionTimeoutMillis: 10_000,
	});
	const borrowed = new WeakSet<pg.PoolClient>();
	const failed = new WeakMap<pg.PoolClient, Error>();
	const clients = new WeakMap<pg.PoolClient, pg.PoolClient>();
	const fallback = (event: DatabaseConnectionEvent) => {
		try {
			if (event.err) console.error('Postgres connection error', event);
		} catch {
			// Reporting must never turn a recoverable disconnect into a crash.
		}
	};
	const report = (
		event: DatabaseConnectionEvent['event'],
		error?: Error,
		details: Pick<DatabaseConnectionEvent, 'state' | 'durationMs'> = {}
	) => {
		const data: DatabaseConnectionEvent = {
			event,
			...details,
			// pg attaches a client to idle errors. Never pass that object to a logger.
			err: error
				? {
						name: error.name,
						message: error.message,
						stack: error.stack,
						code:
							typeof (error as NodeJS.ErrnoException).code === 'string'
								? (error as NodeJS.ErrnoException).code
								: undefined,
					}
				: undefined,
			pool: { total: pool.totalCount, idle: pool.idleCount, waiting: pool.waitingCount },
		};
		try {
			if (options.onConnectionEvent) {
				void Promise.resolve(options.onConnectionEvent(data)).catch(() => fallback(data));
			} else fallback(data);
		} catch {
			fallback(data);
		}
	};
	pool.on('connect', client => {
		// pg removes its own error listener while a client is checked out.
		// Keep ours for the client's lifetime; pg still rejects queries and discards it.
		client.on('error', error => {
			failed.set(client, error);
			if (borrowed.has(client))
				report('db_connection_error', error, { state: 'checked-out' });
		});
	});
	pool.on('acquire', client => borrowed.add(client));
	pool.on('release', (_error, client) => borrowed.delete(client));
	pool.on('error', error => report('db_connection_error', error, { state: 'idle' }));

	// Measure acquisition separately: Kysely query timing starts after pool.connect().
	const dialect = new PostgresDialect({
		pool: {
			async connect() {
				const start = performance.now();
				try {
					const client = await pool.connect();
					report('db_connection_acquired', undefined, {
						durationMs: performance.now() - start,
					});
					let protectedClient = clients.get(client);
					if (!protectedClient) {
						protectedClient = new Proxy(client, {
							get(target, property) {
								if (property === 'release')
									return () => target.release(failed.get(target));
								if (property === 'query')
									return (...args: unknown[]) => {
										const result = Reflect.apply(target.query, target, args);
										// Kysely uses promise queries. Preserve cursor queries unchanged.
										if (!result || typeof result.catch !== 'function')
											return result;
										return result.catch(
											(
												error: Error & { code?: string; severity?: string }
											) => {
												// A backend FATAL response precedes socket close. Discard on
												// release so another request cannot borrow the dying socket.
												if (
													error.severity === 'FATAL' ||
													error.severity === 'PANIC' ||
													error.code?.startsWith('08') ||
													['57P01', '57P02', '57P03'].includes(
														error.code ?? ''
													)
												) {
													failed.set(target, error);
												}
												throw error;
											}
										);
									};
								return Reflect.get(target, property, target);
							},
						});
						clients.set(client, protectedClient);
					}
					return protectedClient;
				} catch (error) {
					report('db_connection_acquire_failed', error as Error, {
						durationMs: performance.now() - start,
					});
					throw error;
				}
			},
			async end() {
				await pool.end();
			},
		},
	});
	return { dialect, pool };
}
