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
import { ModifierOptions } from './modifier-command-options.js';

import L from '../../../i18n/i18n-node.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';

export class ModifierCommand implements Command {
	public names = [L.en.commands.modifier.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.modifier.name(),
		description: L.en.commands.modifier.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.modifier.list.name(),
				description: L.en.commands.modifier.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.modifier.detail.name(),
				description: L.en.commands.modifier.detail.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.modifier.export.name(),
				description: L.en.commands.modifier.export.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [],
			},
			{
				name: L.en.commands.modifier.import.name(),
				description: L.en.commands.modifier.import.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ModifierOptions.MODIFIER_IMPORT_URL,
					ModifierOptions.MODIFIER_IMPORT_MODE,
				],
			},
			{
				name: L.en.commands.modifier.createSheetModifier.name(),
				description: L.en.commands.modifier.createSheetModifier.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ModifierOptions.MODIFIER_NAME_OPTION,
					ModifierOptions.MODIFIER_SHEET_VALUES_OPTION,
					ModifierOptions.MODIFIER_TYPE_OPTION,
					ModifierOptions.MODIFIER_DESCRIPTION_OPTION,
				],
			},
			{
				name: L.en.commands.modifier.createRollModifier.name(),
				description: L.en.commands.modifier.createRollModifier.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					ModifierOptions.MODIFIER_NAME_OPTION,
					ModifierOptions.MODIFIER_VALUE_OPTION,
					ModifierOptions.MODIFIER_TARGET_TAGS_OPTION,
					ModifierOptions.MODIFIER_TYPE_OPTION,
					ModifierOptions.MODIFIER_DESCRIPTION_OPTION,
				],
			},
			{
				name: L.en.commands.modifier.toggle.name(),
				description: L.en.commands.modifier.toggle.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.modifier.update.name(),
				description: L.en.commands.modifier.update.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					ModifierOptions.MODIFIER_SET_OPTION,
					ModifierOptions.MODIFIER_SET_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.modifier.remove.name(),
				description: L.en.commands.modifier.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
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
