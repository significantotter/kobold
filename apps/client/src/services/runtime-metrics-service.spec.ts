import { Client } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';

import { Logger } from './logger.js';
import { RuntimeMetricsService } from './runtime-metrics-service.js';

describe('RuntimeMetricsService', () => {
	it('logs per-shard memory, event-loop, and cache metrics', () => {
		const infoSpy = vi.spyOn(Logger, 'info').mockImplementation(() => {});
		const client = {
			shard: { ids: [1] },
			guilds: {
				cache: new Map([
					[
						'guild-1',
						{
							members: { cache: new Map([['member-1', {}]]) },
							roles: { cache: new Map([['role-1', {}], ['role-2', {}]]) },
						},
					],
				]),
			},
			channels: { cache: new Map([['channel-1', {}]]) },
			users: { cache: new Map([['user-1', {}], ['user-2', {}]]) },
		} as unknown as Client;
		const service = new RuntimeMetricsService(client, 60);

		service.start();
		service.stop();

		expect(infoSpy).toHaveBeenCalledWith(
			'Shard runtime metrics.',
			expect.objectContaining({
				event: 'shard_runtime_metrics',
				shardIds: [1],
				memory: expect.objectContaining({
					rssBytes: expect.any(Number),
					heapUsedBytes: expect.any(Number),
				}),
				cache: {
					guilds: 1,
					channels: 1,
					users: 2,
					guildMembers: 1,
					guildRoles: 2,
				},
				eventLoopDelayMs: expect.objectContaining({
					p95: expect.any(Number),
				}),
			})
		);
	});
});
