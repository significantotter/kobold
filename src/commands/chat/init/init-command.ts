import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	CommandInteraction,
	PermissionString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { ChatArgs } from '../../../constants/chat-args.js';

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
			},
			{
				name: 'join',
				description:
					'Joins initiative with your active character. ' +
					'Defaults to rolling perception.',
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.SKILL_CHOICE_OPTION,
						description: 'The skill to use for initiative instead of perception.',
						required: false,
					},
					{
						...ChatArgs.ROLL_EXPRESSION_OPTION,
						description:
							'A dice roll expression to use to join initiative. ' +
							'Modifies your skill if you chose a skill.',
						required: false,
					},
					{
						...ChatArgs.INIT_VALUE_OPTION,
						required: false,
					},
				],
			},
			{
				name: 'end',
				description: 'Ends the initiative in the current channel.',
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: 'remove',
				description: 'Removes a character from initiative.',
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [ChatArgs.INIT_CHARACTER_OPTION],
			},
		],
	};
	public cooldown = new RateLimiter(1, 1000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	constructor(private commands: Command[]) {}

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<void> {
		if (!intr.isAutocomplete()) return;

		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command || !command.autocomplete) {
			return;
		}

		await command.autocomplete(intr, option);
	}

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
