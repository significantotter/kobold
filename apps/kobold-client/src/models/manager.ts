import { Shard, ShardingManager } from 'discord.js';

import { JobService, Logger } from '../services/index.js';
import { Config } from 'kobold-config';

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
		`Launched Shard ${shard.id.toString()}.`;
	}
}
