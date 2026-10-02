import { EventEmitter } from 'node:events';
import { spawnSync } from 'node:child_process';
import { describe, it, expect, vi } from 'vitest';
import { CompiledQuery } from 'kysely';
import { getDialectWithPool } from './db.dialect.js';

// Exercise real pg-pool acquisition, release, removal and replacement without a server.
class Client extends EventEmitter {
	_queryable = true;
	_ending = false;
	connect(callback: (error: null) => void) {
		queueMicrotask(() => callback(null));
	}
	end() {
		this._ending = true;
	}
	async query() {
		return { rows: [{ ok: 1 }] };
	}
	disconnect() {
		this._queryable = false;
		this.emit('error', new Error('Connection terminated unexpectedly'));
	}
}

function fixture(onConnectionEvent = vi.fn()) {
	const result = getDialectWithPool('postgres://unused', { onConnectionEvent });
	Object.assign(result.pool, { Client });
	return { ...result, onConnectionEvent };
}

describe('database connection protection', () => {
	it.each(['idle', 'checked-out'] as const)(
		'handles %s disconnects once and replaces the client',
		async state => {
			const { pool, onConnectionEvent } = fixture();
			try {
				const first = await pool.connect();
				if (state === 'idle') first.release();
				expect(() => (first as unknown as Client).disconnect()).not.toThrow();
				if (state === 'checked-out') first.release();
				expect(onConnectionEvent).toHaveBeenCalledTimes(1);
				expect(onConnectionEvent.mock.calls[0][0]).toMatchObject({
					state,
					event: 'db_connection_error',
				});
				expect(onConnectionEvent.mock.calls[0][0].err).not.toHaveProperty('client');
				const second = await pool.connect();
				expect(second).not.toBe(first);
				second.release();
			} finally {
				await pool.end();
			}
		}
	);

	it('does not accumulate client listeners across reuse', async () => {
		const { pool } = fixture();
		try {
			for (let i = 0; i < 30; i++) {
				const client = await pool.connect();
				expect(client.listenerCount('error')).toBe(1);
				client.release();
				expect(client.listenerCount('error')).toBe(2);
			}
		} finally {
			await pool.end();
		}
	});

	it.each([false, true])('contains reporting failures (async=%s)', async asynchronous => {
		const output = vi.spyOn(console, 'error').mockImplementation(() => {});
		const { pool } = fixture(
			vi.fn(() => {
				if (asynchronous) return Promise.reject(new Error('logger failed'));
				throw new Error('logger failed');
			})
		);
		try {
			const client = await pool.connect();
			expect(() => (client as unknown as Client).disconnect()).not.toThrow();
			client.release();
			await new Promise(resolve => setImmediate(resolve));
			expect(output).toHaveBeenCalledOnce();
		} finally {
			await pool.end();
		}
	});

	it('reports failed acquisition separately and preserves rejection', async () => {
		const { pool, dialect, onConnectionEvent } = fixture();
		const failure = new Error('connection unavailable');
		vi.spyOn(pool, 'connect').mockRejectedValueOnce(failure as never);
		const driver = dialect.createDriver();
		await driver.init();
		await expect(driver.acquireConnection()).rejects.toBe(failure);
		expect(onConnectionEvent).toHaveBeenCalledWith(
			expect.objectContaining({
				event: 'db_connection_acquire_failed',
				durationMs: expect.any(Number),
			})
		);
		const connection = await driver.acquireConnection();
		expect(await connection.executeQuery(CompiledQuery.raw('select 1'))).toMatchObject({
			rows: [{ ok: 1 }],
		});
		await driver.releaseConnection(connection);
		await driver.destroy();
	});

	it.each([
		{ code: '57P01', discard: true },
		{ code: '08006', discard: true },
		{ code: '23505', discard: false },
	])('handles query error $code without replay (discard=$discard)', async ({ code, discard }) => {
		const { pool, dialect } = fixture();
		const failure = Object.assign(new Error('query failed'), { code });
		const query = vi.spyOn(Client.prototype, 'query').mockRejectedValueOnce(failure);
		const driver = dialect.createDriver();
		await driver.init();
		try {
			const first = await driver.acquireConnection();
			await expect(
				first.executeQuery(CompiledQuery.raw('insert into example values (1)'))
			).rejects.toBe(failure);
			expect(query).toHaveBeenCalledOnce();
			await driver.releaseConnection(first);
			expect(pool.totalCount).toBe(discard ? 0 : 1);
			const second = await driver.acquireConnection();
			expect(second === first).toBe(!discard);
			expect(await second.executeQuery(CompiledQuery.raw('select 1'))).toMatchObject({
				rows: [{ ok: 1 }],
			});
			await driver.releaseConnection(second);
		} finally {
			await driver.destroy();
		}
	});

	it('protects the default factory in a child process without a reporter', () => {
		const result = spawnSync(
			process.execPath,
			[
				'--input-type=module',
				'-e',
				`
			import pg from 'pg';
			import { EventEmitter } from 'node:events';
			import { getDialect } from './src/db.dialect.ts';
			class Client extends EventEmitter {
				_queryable = true;
				connect(cb) { queueMicrotask(() => cb(null)); }
				end() {}
			}
			pg.Pool = class extends pg.Pool { constructor(options) { super({ ...options, Client }); } };
			const driver = getDialect('postgres://unused').createDriver();
			await driver.init();
			// Capture the real pool's client at creation, then emit asynchronously.
			const originalConnect = Client.prototype.connect;
			let client;
			Client.prototype.connect = function(cb) { client = this; originalConnect.call(this, cb); };
			const connection = await driver.acquireConnection();
			await new Promise(resolve => setImmediate(() => {
				client._queryable = false;
				client.emit('error', new Error('disconnect'));
				resolve();
			}));
			await driver.releaseConnection(connection);
			await driver.destroy();
		`,
			],
			{ cwd: process.cwd(), encoding: 'utf8', timeout: 10_000 }
		);
		expect(result.status, result.stderr).toBe(0);
		expect(result.stderr).toContain('Postgres connection error');
	});
});
