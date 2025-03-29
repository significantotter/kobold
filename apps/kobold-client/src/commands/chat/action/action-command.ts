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

import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';
import { ActionOptions } from './action-command-options.js';

export class ActionCommand implements Command {
	public name = L.en.commands.action.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.action.name(),
		description: L.en.commands.action.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.action.list.name(),
				description: L.en.commands.action.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [],
			},
			{
				name: L.en.commands.action.detail.name(),
				description: L.en.commands.action.detail.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [ActionOptions.ACTION_TARGET_OPTION],
			},
			{
				name: L.en.commands.action.create.name(),
				description: L.en.commands.action.create.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionOptions.ACTION_NAME_OPTION,
					ActionOptions.ACTION_TYPE_OPTION,
					ActionOptions.ACTION_ACTIONS_OPTION,
					ActionOptions.ACTION_DESCRIPTION_OPTION,
					ActionOptions.ACTION_BASE_LEVEL_OPTION,
					ActionOptions.ACTION_AUTO_HEIGHTEN_OPTION,
					ActionOptions.ACTION_TAGS_OPTION,
				],
			},
			{
				name: L.en.commands.action.remove.name(),
				description: L.en.commands.action.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ActionOptions.ACTION_TARGET_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.action.set.name(),
				description: L.en.commands.action.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionOptions.ACTION_TARGET_OPTION,
					ActionOptions.ACTION_EDIT_OPTION,
					ActionOptions.ACTION_EDIT_VALUE,
				],
			},
			{
				name: L.en.commands.action.import.name(),
				description: L.en.commands.action.import.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ActionOptions.ACTION_IMPORT_URL_OPTION,
					ActionOptions.ACTION_IMPORT_MODE_OPTION,
				],
			},
			{
				name: L.en.commands.action.export.name(),
				description: L.en.commands.action.export.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [],
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

		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
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
		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command) {
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr);
		if (passesChecks) {
			await command.execute(intr, LL, services);
		}
	}
}
