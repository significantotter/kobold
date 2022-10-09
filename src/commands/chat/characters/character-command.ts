import { CharacterOptions } from './command-options';
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
import { Language } from '../../../models/enum-helpers/index.js';

import { EventData } from '../../../models/internal-models.js';
import { Lang } from '../../../services/index.js';
import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';

export class CharacterCommand implements Command {
	public names = [Language.LL.commands.character.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.character.name(),
		description: Language.LL.commands.character.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				// IMPORT
				name: Language.LL.commands.character.import.name(),
				description: Language.LL.commands.character.import.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...CharacterOptions.IMPORT_OPTION,
						required: true,
					},
				],
			},
			{
				// LIST
				name: Language.LL.commands.character.list.name(),
				description: Language.LL.commands.character.list.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				// REMOVE
				name: Language.LL.commands.character.remove.name(),
				description: Language.LL.commands.character.remove.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				// SET-ACTIVE
				name: Language.LL.commands.character.setActive.name(),
				description: Language.LL.commands.character.setActive.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [CharacterOptions.SET_ACTIVE_NAME_OPTION],
			},
			{
				// SHEET
				name: Language.LL.commands.character.sheet.name(),
				description: Language.LL.commands.character.sheet.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				// UPDATE
				name: Language.LL.commands.character.update.name(),
				description: Language.LL.commands.character.update.description(),
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
