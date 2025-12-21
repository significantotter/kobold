import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import { HelpDefinition, helpContent, helpLinks } from '@kobold/documentation';

export class HelpRollMacroSubCommand extends BaseCommandClass(
	HelpDefinition,
	HelpDefinition.subCommandEnum.rollMacro
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		const embed = new KoboldEmbed();
		embed.setThumbnail(helpLinks.thumbnail);
		embed.setTitle(helpContent.rollMacro.title);
		embed.setDescription(helpContent.rollMacro.description);
		await embed.sendBatches(intr, false);
	}
}
