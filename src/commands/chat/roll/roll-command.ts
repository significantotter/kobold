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
import { ChatArgs } from '../../../constants/chat-args.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { ActionOptions } from '../action/action-command-options.js';
import { InitOptions } from '../init/init-command-options.js';
import L from '../../../i18n/i18n-node.js';
import { InjectedServices } from '../../command.js';

export class RollCommand implements Command {
	public names = [L.en.commands.roll.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.roll.name(),
		description: L.en.commands.roll.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.roll.ability.name(),
				description: L.en.commands.roll.ability.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ChatArgs.ABILITY_CHOICE_OPTION,
						required: true,
					},
					{
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_SECRET_OPTION,
						required: false,
					},
				],
			},
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
					ChatArgs.HEIGHTEN_LEVEL_OPTION,
					{
						...ChatArgs.ATTACK_ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_SECRET_OPTION,
						required: false,
					},
					ChatArgs.ROLL_TARGET_DC_OPTION,
					ChatArgs.ROLL_SAVE_DICE_ROLL_OPTION,
				],
			},
			{
				name: L.en.commands.roll.attack.name(),
				description: L.en.commands.roll.attack.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ChatArgs.ATTACK_CHOICE_OPTION,
						required: true,
					},
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: true },
					{
						...ChatArgs.ATTACK_ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_SECRET_OPTION,
						required: false,
					},
					ChatArgs.ROLL_TARGET_AC_OPTION,
				],
			},
			{
				name: L.en.commands.roll.dice.name(),
				description: L.en.commands.roll.dice.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ChatArgs.ROLL_EXPRESSION_OPTION,
						required: true,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_SECRET_OPTION,
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
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_SECRET_OPTION,
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
						...ChatArgs.SAVE_CHOICE_OPTION,
						required: true,
					},
					{
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_SECRET_OPTION,
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
						...ChatArgs.SKILL_CHOICE_OPTION,
						required: true,
					},
					{
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_SECRET_OPTION,
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
		option: AutocompleteFocusedOption
	): Promise<ApplicationCommandOptionChoiceData[] | undefined> {
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
		LL: TranslationFunctions,
		{},
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
			const data = await command.fetchInjectedDataForCommand?.(intr);
			await command.execute(intr, LL, data, services);
		}
	}
}
