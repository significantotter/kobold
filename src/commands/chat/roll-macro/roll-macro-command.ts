import { Language } from '../../../models/enum-helpers/language.js';
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
import { RollMacroOptions } from './roll-macro-command-options.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

import { EventData } from '../../../models/internal-models.js';
import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';

export class RollMacroCommand implements Command {
	public names = [Language.LL.commands.rollMacro.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.rollMacro.name(),
		description: Language.LL.commands.rollMacro.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: Language.LL.commands.rollMacro.list.name(),
				description: Language.LL.commands.rollMacro.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: Language.LL.commands.rollMacro.create.name(),
				description: Language.LL.commands.rollMacro.create.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [RollMacroOptions.MACRO_NAME_OPTION, RollMacroOptions.MACRO_VALUE_OPTION],
			},
			{
				name: Language.LL.commands.rollMacro.update.name(),
				description: Language.LL.commands.rollMacro.update.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollMacroOptions.MACRO_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					RollMacroOptions.MACRO_VALUE_OPTION,
				],
			},
			{
				name: Language.LL.commands.rollMacro.remove.name(),
				description: Language.LL.commands.rollMacro.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollMacroOptions.MACRO_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
		],
	};
	public cooldown = new RateLimiter(1, 2000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	constructor(public commands: Command[]) {}

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[]> {
		if (!intr.isAutocomplete()) return;

		const command = CommandUtils.getSubCommandByName(
			this.commands,
			intr.options.getSubcommand()
		);
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
		const command = CommandUtils.getSubCommandByName(
			this.commands,
			intr.options.getSubcommand()
		);
		if (!command) {
			return;
		}

		const passesChecks = await CommandUtils.runChecks(command, intr, data);
		if (passesChecks) {
			await command.execute(intr, data, LL);
		}
	}
}
