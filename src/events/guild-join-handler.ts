import { Guild } from 'discord.js';

import { Language } from '../models/enum-helpers/index.js';
import { Lang, Logger } from '../services/index.js';
import { ClientUtils, MessageUtils } from '../utils/index.js';
import { EventHandler } from './index.js';
import Logs from './../config/lang/logs.json' assert { type: 'json' };

export class GuildJoinHandler implements EventHandler {
	public async process(guild: Guild): Promise<void> {
		Logger.info(
			Logs.info.guildJoined
				.replaceAll('{GUILD_NAME}', guild.name)
				.replaceAll('{GUILD_ID}', guild.id)
		);

		// TODO: Get data from database
		// let data = new EventData();

		// Send welcome message to the server's notify channel
		// TODO: Replace "Language.Default" here with the server's language
		let guildLang = Language.Default;
		let notifyChannel = await ClientUtils.findNotifyChannel(guild, guildLang);
		if (notifyChannel) {
			await MessageUtils.send(
				notifyChannel,
				Lang.getEmbed('displayEmbeds.welcome', guildLang).setAuthor({
					name: guild.name,
					iconURL: guild.iconURL(),
				})
			);
		}

		// Send welcome message to owner
		// TODO: Replace "Language.Default" here with the owner's language
		let ownerLang = Language.Default;
		let owner = await guild.fetchOwner();
		if (owner) {
			await MessageUtils.send(
				owner.user,
				Lang.getEmbed('displayEmbeds.welcome', ownerLang).setAuthor({
					name: guild.name,
					iconURL: guild.iconURL(),
				})
			);
		}
	}
}
