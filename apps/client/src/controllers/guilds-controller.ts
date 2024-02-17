import { ShardingManager } from 'discord.js';
import { Request, Response, Router } from 'express';
import router from 'express-promise-router';

import { GetGuildsResponse } from '../models/cluster-api/index.js';
import { Controller } from './controller.js';
import { Config } from './../config/config.js';

export class GuildsController implements Controller {
	public path = '/guilds';
	public router: Router = router();
	public authToken: string = Config.api.secret;

	constructor(protected shardManager: ShardingManager) {}

	public register(): void {
		this.router.get('/', (req, res) => this.getGuilds(req, res));
	}

	protected async getGuilds(req: Request, res: Response): Promise<void> {
		let guilds: string[] = [
			...new Set(
				(
					await this.shardManager.broadcastEval(client => [...client.guilds.cache.keys()])
				).flat()
			),
		];

		let resBody: GetGuildsResponse = {
			guilds,
		};
		res.status(200).json(resBody);
	}
}
