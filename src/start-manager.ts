import './config/config.js';
import { ShardingManager } from 'discord.js';
import 'reflect-metadata';

import { GuildsController, RootController, ShardsController } from './controllers/index.js';
import { Job, UpdateServerCountJob } from './jobs/index.js';
import { Api } from './models/api.js';
import { Manager } from './models/manager.js';
import { DBModel, HttpService, JobService, Logger, MasterApiService } from './services/index.js';
import { MathUtils, ShardUtils } from './utils/index.js';
import { Config } from './config/config.js';
import Logs from './config/lang/logs.json' assert { type: 'json' };
import { filterNotNullOrUndefined } from './utils/type-guards.js';
import { db } from './services/pf2etools/pf2eTools.db.js';
import { CompendiumModel } from './services/pf2etools/compendium.model.js';

async function start(): Promise<void> {
	Logger.info(Logs.info.appStarted);
	DBModel.init(Config.database.url);

	// Dependencies
	let httpService = new HttpService();
	let masterApiService = new MasterApiService(httpService);
	if (Config.clustering.enabled) {
		await masterApiService.register();
	}

	// Sharding
	let shardList: number[];
	let totalShards: number;
	try {
		if (Config.clustering.enabled) {
			let resBody = await masterApiService.login();
			shardList = resBody.shardList;
			let requiredShards = await ShardUtils.requiredShardCount(Config.client.token);
			totalShards = Math.max(requiredShards, resBody.totalShards);
		} else {
			let recommendedShards = await ShardUtils.recommendedShardCount(
				Config.client.token,
				Config.sharding.serversPerShard
			);
			shardList = MathUtils.range(0, recommendedShards);
			totalShards = recommendedShards;
		}
	} catch (error) {
		Logger.error(Logs.error.retrieveShards, error);
		return;
	}

	if (shardList.length === 0) {
		Logger.warn(Logs.warn.managerNoShards);
		return;
	}

	let shardManager = new ShardingManager('dist/start-bot.js', {
		token: Config.client.token,
		mode: (Config.debug.shardMode.enabled ? Config.debug.shardMode.value : 'process') as any,
		respawn: true,
		totalShards,
		shardList,
	});

	// Jobs
	let jobs: Job[] = [
		Config.clustering.enabled ? undefined : new UpdateServerCountJob(shardManager, httpService),
		// TODO: Add new jobs here
	].filter(filterNotNullOrUndefined);

	let manager = new Manager(shardManager, new JobService(jobs));

	// API
	let guildsController = new GuildsController(shardManager);
	let shardsController = new ShardsController(shardManager);
	let rootController = new RootController();
	let api = new Api([guildsController, shardsController, rootController]);

	// Start
	await manager.start();
	await api.start();
	if (Config.clustering.enabled) {
		await masterApiService.ready();
	}
}

process.on('unhandledRejection', (reason, _promise) => {
	Logger.error(Logs.error.unhandledRejection, reason);
});

start().catch(error => {
	Logger.error(Logs.error.unspecified, error);
});
