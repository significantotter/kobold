import { Guild } from 'discord.js';

import { Logger } from '../services/index.js';
import { EventHandler } from './event-handler.js';

export class GuildLeaveHandler implements EventHandler {
	public async process(guild: Guild): Promise<void> {
		Logger.info(`Guild '${guild.name}' (${guild.id}) left.`);
	}
}
