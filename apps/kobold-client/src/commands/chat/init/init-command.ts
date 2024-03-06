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
import { ChatArgs } from '../../../constants/chat-args.js';
import L from '../../../i18n/i18n-node.js';
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from './init-command-options.js';

export class InitCommand implements Command {
	public names = [L.en.commands.init.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.init.name(),
		description: L.en.commands.init.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.init.start.name(),
				description: L.en.commands.init.start.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.init.show.name(),
				description: L.en.commands.init.show.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.init.next.name(),
				description: L.en.commands.init.next.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.init.prev.name(),
				description: L.en.commands.init.prev.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.init.jumpTo.name(),
				description: L.en.commands.init.jumpTo.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [{ ...InitOptions.INIT_CHARACTER_OPTION, required: true }],
			},
			{
				name: L.en.commands.init.join.name(),
				description: L.en.commands.init.join.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...ChatArgs.SKILL_CHOICE_OPTION,
						description:
							L.en.commandOptions.skillChoice.overwrites.initJoinDescription(),
						required: false,
					},
					{
						...ChatArgs.ROLL_EXPRESSION_OPTION,
						description:
							'Dice to roll to join initiative. ' +
							'Modifies your skill if you chose a skill.',
						required: false,
					},
					{
						...InitOptions.INIT_VALUE_OPTION,
						required: false,
					},
					InitOptions.INIT_HIDE_STATS_OPTION,
				],
			},
			{
				name: L.en.commands.init.add.name(),
				description: L.en.commands.init.add.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					InitOptions.INIT_CREATURE_OPTION,
					{
						...InitOptions.ACTOR_NAME_OPTION,
						required: false,
					},
					InitOptions.INIT_CUSTOM_STATS_OPTION,
					{
						...ChatArgs.ROLL_EXPRESSION_OPTION,
						description:
							L.en.commandOptions.rollExpression.overwrites.initAddDescription(),
						required: false,
					},
					{
						...InitOptions.INIT_VALUE_OPTION,
						required: false,
					},
					InitOptions.INIT_ADD_TEMPLATE_OPTION,
					InitOptions.INIT_HIDE_STATS_OPTION,
				],
			},
			{
				name: L.en.commands.init.set.name(),
				description: L.en.commands.init.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...InitOptions.INIT_CHARACTER_OPTION,
						required: true,
					},
					InitOptions.ACTOR_SET_OPTION,
					InitOptions.ACTOR_SET_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.init.remove.name(),
				description: L.en.commands.init.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [{ ...InitOptions.INIT_CHARACTER_OPTION, required: true }],
			},
			{
				name: L.en.commands.init.statBlock.name(),
				description: L.en.commands.init.statBlock.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...InitOptions.INIT_CHARACTER_OPTION,
						required: true,
					},
					InitOptions.INIT_STAT_BLOCK_SECRET_OPTION,
				],
			},
			{
				name: L.en.commands.init.roll.name(),
				description: L.en.commands.init.roll.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...InitOptions.INIT_CHARACTER_OPTION,
						required: true,
					},
					{
						...InitOptions.INIT_ROLL_CHOICE_OPTION,
						required: true,
					},
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: true },
					{
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.DAMAGE_ROLL_MODIFIER_OPTION,
						required: false,
					},
					ChatArgs.ROLL_OVERWRITE_ATTACK_OPTION,
					ChatArgs.ROLL_OVERWRITE_SAVE_OPTION,
					ChatArgs.ROLL_OVERWRITE_DAMAGE_OPTION,
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
				name: L.en.commands.init.end.name(),
				description: L.en.commands.init.end.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
		],
	};
	public cooldown = new RateLimiter(1, 1000);
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
