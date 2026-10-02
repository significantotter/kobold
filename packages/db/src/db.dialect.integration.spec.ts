import pg from 'pg';
import { randomUUID } from 'node:crypto';
import { Kysely, sql } from 'kysely';
import { describe, it, expect } from 'vitest';
import { getDialectWithPool, type DatabaseConnectionEvent } from './db.dialect.js';

// Explicit opt-in: use only a disposable database, never an application URL.
const url = process.env.KOBOLD_RECOVERY_TEST_URL;
describe.skipIf(!url)('Postgres disconnect recovery', () => {
	it('recovers from idle, active-query and between-statement transaction disconnects', async () => {
		const events: DatabaseConnectionEvent[] = [];
		const { dialect, pool } = getDialectWithPool(url!, {
			onConnectionEvent(event) {
				events.push(event);
			},
		});
		const db = new Kysely<Record<string, never>>({ dialect });
		const admin = new pg.Client({ connectionString: url });
		await admin.connect();
		const terminate = (pid: number) => admin.query('select pg_terminate_backend($1)', [pid]);
		const table = `recovery_${randomUUID().replaceAll('-', '')}`;
		const healthy = () => sql<{ ok: number }>`select 1 as ok`.execute(db);
		try {
			await sql`create table ${sql.id(table)} (value integer)`.execute(db);
			for (let i = 0; i < 3; i++) {
				const {
					rows: [row],
				} = await sql<{ pid: number }>`select pg_backend_pid() as pid`.execute(db);
				await terminate(row.pid);
				await new Promise<void>(resolve => {
					if (pool.totalCount === 0) resolve();
					else pool.once('remove', () => resolve());
				});
				expect((await healthy()).rows[0].ok).toBe(1);
			}

			// Observe pg_sleep running before terminating its connection.
			const {
				rows: [row],
			} = await sql<{ pid: number }>`select pg_backend_pid() as pid`.execute(db);
			const running = sql`select pg_sleep(30)`.execute(db);
			const rejected = expect(running).rejects.toThrow();
			for (let attempt = 0; attempt < 100; attempt++) {
				const result = await admin.query(
					'select wait_event from pg_stat_activity where pid = $1',
					[row.pid]
				);
				if (result.rows[0]?.wait_event === 'PgSleep') break;
				if (attempt === 99) throw new Error('Query did not start');
				await new Promise(resolve => setTimeout(resolve, 10));
			}
			await terminate(row.pid);
			await rejected;
			expect((await healthy()).rows[0].ok).toBe(1);

			await expect(
				db.transaction().execute(async trx => {
					const {
						rows: [row],
					} = await sql<{ pid: number }>`select pg_backend_pid() as pid`.execute(trx);
					await sql`insert into ${sql.id(table)} values (1)`.execute(trx);
					const errorCount = events.filter(event => event.state === 'checked-out').length;
					await terminate(row.pid);
					for (let attempt = 0; ; attempt++) {
						if (
							events.filter(event => event.state === 'checked-out').length >
							errorCount
						)
							break;
						if (attempt === 100) throw new Error('Disconnect was not reported');
						await new Promise(resolve => setTimeout(resolve, 5));
					}
					await sql`select 1`.execute(trx);
				})
			).rejects.toThrow();
			expect((await healthy()).rows[0].ok).toBe(1);
			expect((await sql`select * from ${sql.id(table)}`.execute(db)).rows).toEqual([]);
			expect(events.some(event => event.state === 'idle')).toBe(true);
			expect(events.some(event => event.state === 'checked-out')).toBe(true);
			expect(pool.waitingCount).toBe(0);
		} finally {
			try {
				await sql`drop table if exists ${sql.id(table)}`.execute(db);
			} finally {
				await db.destroy();
				await admin.end();
			}
		}
	}, 15_000);
});
