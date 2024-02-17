import { Shard, ShardingManager } from 'discord.js';

import { JobService, Logger } from '../services/index.js';
import { Config } from './../config/config.js';
import Logs from './../config/lang/logs.json' assert { type: 'json' };

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
				Logs.info.managerSpawningShards
					.replaceAll('{SHARD_COUNT}', shardList.length.toLocaleString())
					.replaceAll('{SHARD_LIST}', shardList.join(', '))
			);
			await this.shardManager.spawn({
				amount: this.shardManager.totalShards,
				delay: Config.sharding.spawnDelay * 1000,
				timeout: Config.sharding.spawnTimeout * 1000,
			});
			Logger.info(Logs.info.managerAllShardsSpawned);
		} catch (error) {
			Logger.error(Logs.error.managerSpawningShards, error);
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
		Logger.info(Logs.info.managerLaunchedShard.replaceAll('{SHARD_ID}', shard.id.toString()));
	}
}
