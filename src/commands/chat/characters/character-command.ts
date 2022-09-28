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

export class CharacterCommand implements Command {
	public names = ['character'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'character',
		description: `Character management`,
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: 'import',
				description: `imports a Wanderer's guide character`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.IMPORT_OPTION,
						required: true,
					},
				],
			},
			{
				name: 'list',
				description: `lists all active characters`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: 'remove',
				description: `removes an already imported character`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: 'set-active',
				description: `sets a character as the active character`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [ChatArgs.SET_ACTIVE_NAME_OPTION],
			},
			{
				name: 'sheet',
				description: `displays the active character's sheet`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: 'update',
				description: `updates an already imported character`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
		],
	};
	public cooldown = new RateLimiter(1, 5000);
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
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr, data);
		if (passesChecks) {
			await command.execute(intr, data);
		}
	}
}
