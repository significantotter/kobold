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
import { ModifierOptions } from './modifier-command-options.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

import { EventData } from '../../../models/internal-models.js';
import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';

export class ModifierCommand implements Command {
	public names = [Language.LL.commands.modifier.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.modifier.name(),
		description: Language.LL.commands.modifier.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: Language.LL.commands.modifier.list.name(),
				description: Language.LL.commands.modifier.list.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: Language.LL.commands.modifier.detail.name(),
				description: Language.LL.commands.modifier.detail.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [{ ...ModifierOptions.MODIFIER_NAME_OPTION, autocomplete: true }],
			},
			{
				name: Language.LL.commands.modifier.export.name(),
				description: Language.LL.commands.modifier.export.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [],
			},
			{
				name: Language.LL.commands.modifier.import.name(),
				description: Language.LL.commands.modifier.import.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					ModifierOptions.MODIFIER_IMPORT_URL,
					ModifierOptions.MODIFIER_IMPORT_MODE,
				],
			},
			{
				name: Language.LL.commands.modifier.createSheetModifier.name(),
				description: Language.LL.commands.modifier.createSheetModifier.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					ModifierOptions.MODIFIER_NAME_OPTION,
					ModifierOptions.MODIFIER_TYPE_OPTION,
					ModifierOptions.MODIFIER_SHEET_VALUES_OPTION,
					ModifierOptions.MODIFIER_DESCRIPTION_OPTION,
				],
			},
			{
				name: Language.LL.commands.modifier.createRollModifier.name(),
				description: Language.LL.commands.modifier.createRollModifier.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					ModifierOptions.MODIFIER_NAME_OPTION,
					ModifierOptions.MODIFIER_TYPE_OPTION,
					ModifierOptions.MODIFIER_VALUE_OPTION,
					ModifierOptions.MODIFIER_TARGET_TAGS_OPTION,
					ModifierOptions.MODIFIER_DESCRIPTION_OPTION,
				],
			},
			{
				name: Language.LL.commands.modifier.toggle.name(),
				description: Language.LL.commands.modifier.toggle.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [{ ...ModifierOptions.MODIFIER_NAME_OPTION, autocomplete: true }],
			},
			{
				name: Language.LL.commands.modifier.update.name(),
				description: Language.LL.commands.modifier.update.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{ ...ModifierOptions.MODIFIER_NAME_OPTION, autocomplete: true },
					ModifierOptions.MODIFIER_SET_OPTION,
					ModifierOptions.MODIFIER_SET_VALUE_OPTION,
				],
			},
			{
				name: Language.LL.commands.modifier.remove.name(),
				description: Language.LL.commands.modifier.remove.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [{ ...ModifierOptions.MODIFIER_NAME_OPTION, autocomplete: true }],
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
