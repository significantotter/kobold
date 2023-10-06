import { ActivityType, Client, ShardingManager } from 'discord.js';
import { createRequire } from 'node:module';

import { Job } from './index.js';
import { CustomClient } from '../extensions/index.js';
import { BotSite } from '../models/config-models.js';
import { HttpService, Logger } from '../services/index.js';
import { ShardUtils } from '../utils/index.js';
import { Config } from '../config/config.js';

const require = createRequire(import.meta.url);

export class UpdateServerCountJob implements Job {
	public name = 'Update Server Count';
	public schedule: string = Config.jobs.updateServerCount.schedule;
	public log: boolean = Config.jobs.updateServerCount.log;
	public runOnce: boolean = Config.jobs.updateServerCount.runOnce;
	public initialDelaySecs: number = Config.jobs.updateServerCount.initialDelaySecs;

	private botSites: BotSite[];

	constructor(
		private shardManager: ShardingManager,
		private httpService: HttpService
	) {
		this.botSites = Config.botSites.filter(botSite => botSite.enabled);
	}

	public async run(): Promise<void> {
		let serverCount = await ShardUtils.serverCount(this.shardManager);

		let type = ActivityType.Streaming;
		let name = `to ${serverCount.toLocaleString()} servers`;
		let url = '';

		await this.shardManager.broadcastEval(
			(client: Client, context) => {
				return client instanceof CustomClient
					? client.setPresence(context.type, context.name, context.url)
					: undefined;
			},
			{ context: { type, name, url } }
		);

		Logger.info(`Updated server count. Connected to ${serverCount} total servers.`);

		for (let botSite of this.botSites) {
			try {
				let body = JSON.parse(
					botSite.body.replaceAll('{{SERVER_COUNT}}', serverCount.toString())
				);
				let res = await this.httpService.post(botSite.url, botSite.authorization, body);

				if (!res.ok) {
					throw res;
				}
			} catch (error) {
				if (error instanceof Error) {
					Logger.error(
						`An error occurred while updating the server count on '${botSite.name}'`,
						error
					);
				} else {
					Logger.error(
						`An error occurred while updating the server count on '${botSite.name}'`
					);
					console.error(error);
				}
				continue;
			}

			Logger.info(`Updated server count on '${botSite.name}'`);
		}
	}
}
