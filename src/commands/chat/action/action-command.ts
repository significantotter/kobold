import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	ApplicationCommandOptionChoiceData,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { Language } from '../../../models/enum-helpers/index.js';

import { EventData } from '../../../models/internal-models.js';
import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { ActionOptions } from './action-command-options.js';

export class ActionCommand implements Command {
	public names = [Language.LL.commands.action.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.action.name(),
		description: Language.LL.commands.action.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: Language.LL.commands.action.list.name(),
				description: Language.LL.commands.action.list.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
			{
				name: Language.LL.commands.action.create.name(),
				description: Language.LL.commands.action.create.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					ActionOptions.ACTION_NAME_OPTION,
					ActionOptions.ACTION_TYPE_OPTION,
					ActionOptions.ACTION_ACTIONS_OPTION,
					ActionOptions.ACTION_DESCRIPTION_OPTION,
					ActionOptions.ACTION_BASE_LEVEL_OPTION,
					ActionOptions.ACTION_AUTO_HEIGHTEN_OPTION,
				],
			},
			{
				name: Language.LL.commands.action.remove.name(),
				description: Language.LL.commands.action.remove.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [{ ...ActionOptions.ACTION_TARGET_OPTION, autocomplete: true }],
			},
			// {
			// 	name: Language.LL.commands.action.addRoll.name(),
			// 	description: Language.LL.commands.action.addRoll.description(),
			// 	type: ApplicationCommandOptionType.Subcommand.valueOf(),
			// 	options: [
			// 		ActionOptions.ACTION_TARGET_OPTION,
			// 		ActionOptions.ACTION_DICE_ROLL_OPTION,
			// 		ActionOptions.ACTION_ROLL_TAGS_OPTION,
			// 	],
			// },
			// {
			// 	name: Language.LL.commands.action.removeRoll.name(),
			// 	description: Language.LL.commands.action.removeRoll.description(),
			// 	type: ApplicationCommandOptionType.Subcommand.valueOf(),
			// 	options: [ActionOptions.ACTION_ROLL_TARGET_OPTION],
			// },
			// {
			// 	name: Language.LL.commands.action.import.name(),
			// 	description: Language.LL.commands.action.import.description(),
			// 	type: ApplicationCommandOptionType.Subcommand.valueOf(),
			// 	options: [
			// 		ActionOptions.ACTION_IMPORT_URL_OPTION,
			// 		ActionOptions.ACTION_IMPORT_MODE_OPTION,
			// 	],
			// },
			// {
			// 	name: Language.LL.commands.action.export.name(),
			// 	description: Language.LL.commands.action.export.description(),
			// 	type: ApplicationCommandOptionType.Subcommand.valueOf(),
			// 	options: [],
			// },
		],
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	constructor(public commands: Command[]) {}

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;

		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command || !command.autocomplete) {
			return;
		}

		return await command.autocomplete(intr, option);
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		data: EventData,
		LL: TranslationFunctions
	): Promise<void> {
		if (!intr.isChatInputCommand()) return;
		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command) {
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr, data);
		if (passesChecks) {
			await command.execute(intr, data, LL);
		}
	}
}
