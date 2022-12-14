import { Guild } from 'discord.js';

import { Logger } from '../services/index.js';
import { EventHandler } from './index.js';
import Logs from './../config/lang/logs.json';

export class GuildLeaveHandler implements EventHandler {
	public async process(guild: Guild): Promise<void> {
		Logger.info(
			Logs.info.guildLeft
				.replaceAll('{GUILD_NAME}', guild.name)
				.replaceAll('{GUILD_ID}', guild.id)
		);
	}
}
