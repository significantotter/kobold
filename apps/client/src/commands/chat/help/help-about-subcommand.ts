import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import { HelpDefinition, helpContent, helpLinks } from '@kobold/documentation';

export class HelpAboutSubCommand extends BaseCommandClass(
	HelpDefinition,
	HelpDefinition.subCommandEnum.about
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		const embed = new KoboldEmbed();
		embed.setThumbnail(helpLinks.thumbnail);
		embed.setTitle(helpContent.about.title);
		if (helpContent.about.description) {
			embed.setDescription(helpContent.about.description);
		}
		if (helpContent.about.fields) {
			embed.addFields(helpContent.about.fields);
		}
		await embed.sendBatches(intr, false);
	}
}
