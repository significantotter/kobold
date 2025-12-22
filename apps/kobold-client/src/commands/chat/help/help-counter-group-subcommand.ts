import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import { HelpDefinition, helpContent, helpLinks } from '@kobold/documentation';

export class HelpCounterGroupSubCommand extends BaseCommandClass(
	HelpDefinition,
	HelpDefinition.subCommandEnum.counterGroup
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		const embed = new KoboldEmbed();
		embed.setThumbnail(helpLinks.thumbnail);
		embed.setTitle(helpContent.counterGroup.title);
		embed.setDescription(helpContent.counterGroup.description);
		await embed.sendBatches(intr, false);
	}
}
