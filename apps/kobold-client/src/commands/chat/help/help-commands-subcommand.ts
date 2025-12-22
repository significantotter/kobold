import { ChatInputCommandInteraction } from 'discord.js';
import { KoboldEmbed } from '../../../utils/kobold-embed-utils.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import {
	HelpDefinition,
	helpContent,
	helpLinks,
	commands as documentationCommands,
} from '@kobold/documentation';

export class HelpCommandsSubCommand extends BaseCommandClass(
	HelpDefinition,
	HelpDefinition.subCommandEnum.commands
) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		const embed = new KoboldEmbed();
		embed.setThumbnail(helpLinks.thumbnail);
		embed.setTitle(helpContent.commands.title);

		// Build fields for each command and its subcommands from documentation
		const fields: { name: string; value: string }[] = [];

		for (const docCommand of documentationCommands) {
			const commandName = docCommand.definition.metadata.name;
			const subCommands = Object.values(docCommand.definition.subCommands);

			if (subCommands.length === 0) continue;

			const subCommandList = subCommands
				.map(sub => `\`/${commandName} ${sub.name}\` ${sub.description}`)
				.join('\n');

			fields.push({
				name: commandName,
				value: subCommandList,
			});
		}

		embed.addFields(fields);
		await embed.sendBatches(intr, false);
	}
}
