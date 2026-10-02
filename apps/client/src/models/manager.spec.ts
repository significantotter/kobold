import { EventEmitter } from 'node:events';
import { Shard, ShardingManager, ShardEvents } from 'discord.js';
import { describe, expect, it, vi } from 'vitest';

import { JobService } from '../services/job-service.js';
import { Logger } from '../services/logger.js';
import { Manager } from './manager.js';

describe('Manager shard lifecycle telemetry', () => {
	it('registers and logs shard lifecycle events', () => {
		const infoSpy = vi.spyOn(Logger, 'info').mockImplementation(() => {});
		const warnSpy = vi.spyOn(Logger, 'warn').mockImplementation(() => {});
		const errorSpy = vi.spyOn(Logger, 'error').mockResolvedValue(undefined);
		const manager = new Manager({} as ShardingManager, {} as JobService);
		const shard = Object.assign(new EventEmitter(), { id: 2 }) as unknown as Shard;

		(manager as unknown as { onShardCreate(shard: Shard): void }).onShardCreate(shard);
		shard.emit(ShardEvents.Spawn, {
			pid: 42,
			exitCode: null,
			signalCode: null,
			killed: false,
		});
		shard.emit(ShardEvents.Disconnect);
		shard.emit(ShardEvents.Reconnecting);
		shard.emit(ShardEvents.Resume);
		shard.emit(ShardEvents.Death, {
			pid: 42,
			exitCode: null,
			signalCode: 'SIGKILL',
			killed: true,
		});
		shard.emit(ShardEvents.Error, new Error('gateway failure'));

		expect(infoSpy).toHaveBeenCalledWith(
			'Created shard 2.',
			expect.objectContaining({ event: 'manager_shard_created', shardId: 2 })
		);
		expect(warnSpy).toHaveBeenCalledWith(
			'Shard 2 disconnected.',
			expect.objectContaining({ event: 'manager_shard_disconnect' })
		);
		expect(errorSpy).toHaveBeenCalledWith(
			'Shard 2 process died.',
			expect.objectContaining({
				event: 'manager_shard_death',
				signalCode: 'SIGKILL',
			})
		);
		expect(errorSpy).toHaveBeenCalledWith(
			'Shard 2 encountered an error.',
			expect.objectContaining({ event: 'manager_shard_error' })
		);
	});
});
