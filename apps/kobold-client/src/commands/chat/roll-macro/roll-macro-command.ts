import {
	ApplicationCommandOptionChoiceData,
	ApplicationCommandOptionType,
	ApplicationCommandType,
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	ChatInputCommandInteraction,
	PermissionsString,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { RollMacroOptions } from './roll-macro-command-options.js';

import { L } from '../../../i18n/i18n-node.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';

export class RollMacroCommand implements Command {
	public names = [L.en.commands.rollMacro.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.rollMacro.name(),
		description: L.en.commands.rollMacro.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.rollMacro.list.name(),
				description: L.en.commands.rollMacro.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.rollMacro.create.name(),
				description: L.en.commands.rollMacro.create.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [RollMacroOptions.MACRO_NAME_OPTION, RollMacroOptions.MACRO_VALUE_OPTION],
			},
			{
				name: L.en.commands.rollMacro.set.name(),
				description: L.en.commands.rollMacro.set.description(),
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
				name: L.en.commands.rollMacro.remove.name(),
				description: L.en.commands.rollMacro.remove.description(),
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
		option: AutocompleteFocusedOption,
		services: InjectedServices
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
		if (!intr.isAutocomplete()) return;

		const command = CommandUtils.getSubCommandByName(
			this.commands,
			intr.options.getSubcommand()
		);
		if (!command || !command.autocomplete) {
			return;
		}

		return await command.autocomplete(intr, option, services);
	}

	public async execute(
		intr: ChatInputCommandInteraction,
		LL: TranslationFunctions,
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
			await command.execute(intr, LL, services);
		}
	}
}
