import { ShardingManager, ActivityType, Client } from 'discord.js';
import { Request, Response, Router } from 'express';
import router from 'express-promise-router';

import { CustomClient } from '../extensions/index.js';
import { mapClass } from '../middleware/index.js';
import {
	GetShardsResponse,
	SetShardPresencesRequest,
	ShardInfo,
	ShardStats,
} from '../models/cluster-api/index.js';
import { Logger } from '../services/index.js';
import { Controller } from './index.js';
import { Config } from './../config/config.js';
import Logs from './../config/lang/logs.json' assert { type: 'json' };

export class ShardsController implements Controller {
	public path = '/shards';
	public router: Router = router();
	public authToken: string = Config.api.secret;

	constructor(protected shardManager: ShardingManager) {}

	public register(): void {
		this.router.get('/', (req, res) => this.getShards(req, res));
		this.router.put('/presence', mapClass(SetShardPresencesRequest), (req, res) =>
			this.setShardPresences(req, res)
		);
	}

	protected async getShards(req: Request, res: Response): Promise<void> {
		let shardDatas = await Promise.all(
			this.shardManager.shards.map(async shard => {
				let shardInfo: ShardInfo = {
					id: shard.id,
					ready: shard.ready,
					error: false,
				};

				try {
					let uptime = (await shard.fetchClientValue('uptime')) as number;
					shardInfo.uptimeSecs = Math.floor(uptime / 1000);
				} catch (error) {
					Logger.error(Logs.error.managerShardInfo, error);
					shardInfo.error = true;
				}

				return shardInfo;
			})
		);

		let stats: ShardStats = {
			shardCount: this.shardManager.shards.size,
			uptimeSecs: Math.floor(process.uptime()),
		};

		let resBody: GetShardsResponse = {
			shards: shardDatas,
			stats,
		};
		res.status(200).json(resBody);
	}

	protected async setShardPresences(req: Request, res: Response): Promise<void> {
		let reqBody: SetShardPresencesRequest = res.locals.input;

		await this.shardManager.broadcastEval(
			(client: Client, context) => {
				return client instanceof CustomClient
					? client.setPresence(context.type as any, context.name, context.url)
					: null;
			},
			{
				context: {
					type: ActivityType[Number(reqBody.type)],
					name: reqBody.name,
					url: reqBody.url,
				},
			}
		);

		res.sendStatus(200);
	}
}
