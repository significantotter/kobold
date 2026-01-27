import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import { HelpDefinition, helpContent, helpLinks } from '@kobold/documentation';

export class HelpFaqSubCommand extends BaseCommandClass(
	HelpDefinition,
	HelpDefinition.subCommandEnum.faq
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		const embed = new KoboldEmbed();
		embed.setThumbnail(helpLinks.thumbnail);
		embed.setTitle(helpContent.faq.title);
		if (helpContent.faq.fields) {
			embed.addFields(helpContent.faq.fields);
		}
		await embed.sendBatches(intr, false);
	}
}
