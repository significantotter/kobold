import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import { CommandInteraction, PermissionString } from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';

import { EventData } from '../../../models/internal-models.js';
import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';

export class InitCommand implements Command {
	public names = ['init'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'init',
		description: `Initiative Tracking`,
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: 'start',
				description: 'Start initiative in the current channel.',
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						name: 'test_option',
						description: 'does this work?',
						required: true,
						type: 3,
					},
				],
			},
		],
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	constructor(private commands: Command[]) {}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command) {
			await InteractionUtils.send(intr, `Yip! Ran the base command!`);
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr, data);
		if (passesChecks) {
			await command.execute(intr, data);
		}
	}
}
