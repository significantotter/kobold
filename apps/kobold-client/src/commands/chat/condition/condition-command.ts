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

import L from '../../../i18n/i18n-node.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';
import { ModifierOptions } from '../modifier/modifier-command-options.js';
import { GameplayOptions } from '../gameplay/gameplay-command-options.js';
import { ConditionOptions } from './condition-command-options.js';

export class ConditionCommand implements Command {
	public names = [L.en.commands.condition.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.condition.name(),
		description: L.en.commands.condition.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.condition.applyCustom.name(),
				description: L.en.commands.condition.applyCustom.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ModifierOptions.MODIFIER_NAME_OPTION,
					ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION,
					ModifierOptions.MODIFIER_SHEET_VALUES_OPTION,
					ModifierOptions.MODIFIER_ROLL_ADJUSTMENT,
					ModifierOptions.MODIFIER_ROLL_TARGET_TAGS_OPTION,
					ModifierOptions.MODIFIER_TYPE_OPTION,
					ModifierOptions.MODIFIER_DESCRIPTION_OPTION,
					ModifierOptions.MODIFIER_INITIATIVE_NOTE_OPTION,
				],
			},
			{
				name: L.en.commands.condition.applyModifier.name(),
				description: L.en.commands.condition.applyModifier.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					{
						...ModifierOptions.MODIFIER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.condition.list.name(),
				description: L.en.commands.condition.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [GameplayOptions.GAMEPLAY_TARGET_CHARACTER],
			},
			{
				name: L.en.commands.condition.set.name(),
				description: L.en.commands.condition.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ConditionOptions.CONDITION_NAME_OPTION,
					ModifierOptions.MODIFIER_SET_OPTION,
					ModifierOptions.MODIFIER_SET_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.condition.remove.name(),
				description: L.en.commands.condition.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ConditionOptions.CONDITION_NAME_OPTION,
				],
			},
			{
				name: L.en.commands.condition.severity.name(),
				description: L.en.commands.condition.severity.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
					ConditionOptions.CONDITION_NAME_OPTION,
					{ ...ModifierOptions.MODIFIER_SEVERITY_VALUE_OPTION, required: true },
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
