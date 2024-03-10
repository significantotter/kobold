import { Guild, Locale } from 'discord.js';

import { Logger } from '../services/index.js';
import { ClientUtils, MessageUtils } from '../utils/index.js';
import { KoboldEmbed } from '../utils/kobold-embed-utils.js';
import { refs } from '../constants/common-text.js';
import _ from 'lodash';
import { EventHandler } from './event-handler.js';

const welcomeEmbed = new KoboldEmbed({
	title: 'Yip! Thank you for using Kobold.',
	description: refs.bot.description,
	fields: [
		{
			name: 'Important Commands',
			value: refs.importantCommands.join('\n'),
		},
		{
			name: 'Links',
			value: [
				refs.embedLinks.invite,
				refs.embedLinks.donate,
				refs.embedLinks.support,
				refs.embedLinks.vote,
				refs.embedLinks.pathbuilder,
				refs.embedLinks.wanderersGuide,
			].join('\n'),
		},
	],
});

export class GuildJoinHandler implements EventHandler {
	public async process(guild: Guild): Promise<void> {
		Logger.info(`Guild '${guild.name}' (${guild.id}) joined.`);

		// TODO: Get data from database
		// let data = new EventData();

		// Send welcome message to the server's notify channel
		let notifyChannel = await ClientUtils.findNotifyChannel(guild, Locale.EnglishUS);
		if (notifyChannel) {
			await MessageUtils.send(notifyChannel, welcomeEmbed);
		}
	}
}
