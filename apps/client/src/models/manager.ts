import { Shard, ShardingManager, ShardEvents, ShardEventTypes } from 'discord.js';

import { JobService, Logger } from '../services/index.js';
import { Config } from '@kobold/config';

export class Manager {
	constructor(
		protected shardManager: ShardingManager,
		protected jobService: JobService
	) {}

	public async start(): Promise<void> {
		this.registerListeners();

		let shardList = this.shardManager.shardList as number[];

		try {
			Logger.info(
				`Spawning ${shardList.length.toLocaleString()} shards: [${shardList.join(', ')}].`
			);
			await this.shardManager.spawn({
				amount: this.shardManager.totalShards,
				delay: Config.sharding.spawnDelay * 1000,
				timeout: Config.sharding.spawnTimeout * 1000,
			});
			Logger.info(`All shards have been spawned.`);
		} catch (error) {
			Logger.error(`An error occurred while spawning shards.`, error);
			return;
		}

		if (Config.debug.dummyMode.enabled) {
			return;
		}

		this.jobService.start();
	}

	protected registerListeners(): void {
		this.shardManager.on('shardCreate', shard => this.onShardCreate(shard));
	}

	protected onShardCreate(shard: Shard): void {
		Logger.info(`Created shard ${shard.id}.`, {
			event: 'manager_shard_created',
			shardId: shard.id,
		});

		shard.on(ShardEvents.Spawn, child => this.onShardSpawn(shard, child));
		shard.on(ShardEvents.Ready, () => this.onShardReady(shard));
		shard.on(ShardEvents.Disconnect, () => this.onShardDisconnect(shard));
		shard.on(ShardEvents.Reconnecting, () => this.onShardReconnecting(shard));
		shard.on(ShardEvents.Resume, () => this.onShardResume(shard));
		shard.on(ShardEvents.Death, child => this.onShardDeath(shard, child));
		shard.on(ShardEvents.Error, error => this.onShardError(shard, error));
	}

	protected shardProcessDetails(child: ShardEventTypes['death'][0]): Record<string, unknown> {
		if ('threadId' in child) {
			return { threadId: child.threadId };
		}
		return {
			pid: child.pid,
			exitCode: child.exitCode,
			signalCode: child.signalCode,
			killed: child.killed,
		};
	}

	protected onShardSpawn(shard: Shard, child: ShardEventTypes['spawn'][0]): void {
		Logger.info(`Spawned shard ${shard.id}.`, {
			event: 'manager_shard_spawn',
			shardId: shard.id,
			...this.shardProcessDetails(child),
		});
	}

	protected onShardReady(shard: Shard): void {
		Logger.info(`Shard ${shard.id} reported ready.`, {
			event: 'manager_shard_ready',
			shardId: shard.id,
		});
	}

	protected onShardDisconnect(shard: Shard): void {
		Logger.warn(`Shard ${shard.id} disconnected.`, {
			event: 'manager_shard_disconnect',
			shardId: shard.id,
		});
	}

	protected onShardReconnecting(shard: Shard): void {
		Logger.warn(`Shard ${shard.id} is reconnecting.`, {
			event: 'manager_shard_reconnecting',
			shardId: shard.id,
		});
	}

	protected onShardResume(shard: Shard): void {
		Logger.info(`Shard ${shard.id} resumed.`, {
			event: 'manager_shard_resume',
			shardId: shard.id,
		});
	}

	protected onShardDeath(shard: Shard, child: ShardEventTypes['death'][0]): void {
		void Logger.error(`Shard ${shard.id} process died.`, {
			event: 'manager_shard_death',
			shardId: shard.id,
			...this.shardProcessDetails(child),
		});
	}

	protected onShardError(shard: Shard, error: Error): void {
		void Logger.error(`Shard ${shard.id} encountered an error.`, {
			err: error,
			event: 'manager_shard_error',
			shardId: shard.id,
		});
	}
}
