import { ShardingManager } from 'discord.js';
import 'reflect-metadata';
import 'kobold-config';

import { Config } from 'kobold-config';
import { GuildsController, RootController, ShardsController } from './controllers/index.js';
import { UpdateServerCountJob } from './jobs/index.js';
import { Api } from './models/api.js';
import { Manager } from './models/manager.js';
import { HttpService, JobService, Logger, MasterApiService } from './services/index.js';
import { Job } from './services/job-service.js';
import { MathUtils, ShardUtils } from './utils/index.js';
import { filterNotNullOrUndefined } from './utils/type-guards.js';
import { migrateToLatest } from 'kobold-db';
import { spawn } from 'child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

async function start(): Promise<void> {
	Logger.info(`Migrating Database.`);
	await migrateToLatest();
	Logger.info(`Starting Command Registration Subprocess.`);
	const commandRegistration = spawn(
		'node',
		[path.join('dist', `start-bot.js`), 'commands', 'register'],
		{
			stdio: 'inherit',
		}
	);
	commandRegistration.stdout?.on?.('data', data => {
		Logger.info(`stdout: ${data}`);
	});

	commandRegistration.stderr?.on?.('data', data => {
		Logger.error(`stderr: ${data}`);
	});

	commandRegistration.on('close', code => {
		Logger.info(`Command Registration Subprocess exited with code ${code}`);
	});
	Logger.info(`Application started.`);

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
		Logger.error(`An error occurred while retrieving which shards to spawn.`, error);
		return;
	}

	if (shardList.length === 0) {
		Logger.warn(`No shards to spawn.`);
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
	Logger.error(`An unhandled promise rejection occurred.`, reason);
});

start().catch(error => {
	Logger.error(`An unspecified error occurred.`, error);
});
