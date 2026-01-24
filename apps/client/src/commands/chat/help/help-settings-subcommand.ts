import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import { HelpDefinition, helpContent, helpLinks } from '@kobold/documentation';

export class HelpSettingsSubCommand extends BaseCommandClass(
	HelpDefinition,
	HelpDefinition.subCommandEnum.settings
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		const embed = new KoboldEmbed();
		embed.setThumbnail(helpLinks.thumbnail);
		embed.setTitle(helpContent.settings.title);
		embed.setDescription(helpContent.settings.description);
		await embed.sendBatches(intr, false);
	}
}
