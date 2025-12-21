import { ChatInputCommandInteraction } from 'discord.js';
import { BaseCommandClass, InjectedServices } from '../../command.js';
import { HelpDefinition as HelpCommandDocumentation } from '@kobold/documentation';
import { CommandUtils } from '../../../utils/index.js';

export class HelpCommand extends BaseCommandClass(HelpCommandDocumentation) {
	public async execute(
		intr: ChatInputCommandInteraction,
		services: InjectedServices
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		const command = CommandUtils.getSubCommandByName(
			this.commands,
			intr.options.getSubcommand()
		);
		if (!command) {
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr);
		if (passesChecks) {
			await command.execute(intr, services);
		}
	}
}
