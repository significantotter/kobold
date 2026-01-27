import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import { HelpDefinition, helpContent, helpLinks } from '@kobold/documentation';

export class HelpAttributesAndTagsSubCommand extends BaseCommandClass(
	HelpDefinition,
	HelpDefinition.subCommandEnum.attributesAndTags
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		const embed = new KoboldEmbed();
		embed.setThumbnail(helpLinks.thumbnail);
		embed.setTitle(helpContent.attributesAndTags.title);
		embed.setDescription(helpContent.attributesAndTags.description);
		if (helpContent.attributesAndTags.fields) {
			embed.setFields(helpContent.attributesAndTags.fields);
		}
		await embed.sendBatches(intr, false);
	}
}
