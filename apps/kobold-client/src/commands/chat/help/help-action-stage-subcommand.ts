import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import { HelpDefinition, helpContent, helpLinks } from '@kobold/documentation';

export class HelpActionStageSubCommand extends BaseCommandClass(
	HelpDefinition,
	HelpDefinition.subCommandEnum.actionStage
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		const embed = new KoboldEmbed();
		embed.setThumbnail(helpLinks.thumbnail);
		embed.setTitle(helpContent.actionStage.title);
		embed.setDescription(helpContent.actionStage.description);
		await embed.sendBatches(intr, false);
	}
}
