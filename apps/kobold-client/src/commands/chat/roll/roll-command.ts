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
import { ActionOptions } from '../action/action-command-options.js';
import { InitOptions } from '../init/init-command-options.js';
import { RollOptions } from './roll-command-options.js';

export class RollCommand implements Command {
	public name = L.en.commands.roll.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.roll.name(),
		description: L.en.commands.roll.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.roll.action.name(),
				description: L.en.commands.roll.action.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ActionOptions.ACTION_TARGET_OPTION,
						required: true,
					},
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: true },
					RollOptions.HEIGHTEN_LEVEL_OPTION,
					{
						...RollOptions.ATTACK_ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.DAMAGE_ROLL_MODIFIER_OPTION,
						required: false,
					},
					RollOptions.ROLL_OVERWRITE_ATTACK_OPTION,
					RollOptions.ROLL_OVERWRITE_SAVE_OPTION,
					RollOptions.ROLL_OVERWRITE_DAMAGE_OPTION,
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
					RollOptions.ROLL_TARGET_DC_OPTION,
					RollOptions.ROLL_SAVE_DICE_ROLL_OPTION,
				],
			},
			{
				name: L.en.commands.roll.attack.name(),
				description: L.en.commands.roll.attack.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.ATTACK_CHOICE_OPTION,
						required: true,
					},
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: true },
					{
						...RollOptions.ATTACK_ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.DAMAGE_ROLL_MODIFIER_OPTION,
						required: false,
					},
					RollOptions.ROLL_OVERWRITE_ATTACK_OPTION,
					RollOptions.ROLL_OVERWRITE_DAMAGE_OPTION,
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
					RollOptions.ROLL_TARGET_AC_OPTION,
				],
			},
			{
				name: L.en.commands.roll.dice.name(),
				description: L.en.commands.roll.dice.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.ROLL_EXPRESSION_OPTION,
						required: true,
					},
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
				],
			},
			{
				name: L.en.commands.roll.perception.name(),
				description: L.en.commands.roll.perception.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
				],
			},
			{
				name: L.en.commands.roll.save.name(),
				description: L.en.commands.roll.save.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.SAVE_CHOICE_OPTION,
						required: true,
					},
					{
						...RollOptions.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
					},
				],
			},
			{
				name: L.en.commands.roll.skill.name(),
				description: L.en.commands.roll.skill.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...RollOptions.SKILL_CHOICE_OPTION,
						required: true,
					},
					{
						...RollOptions.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...RollOptions.ROLL_SECRET_OPTION,
						required: false,
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
