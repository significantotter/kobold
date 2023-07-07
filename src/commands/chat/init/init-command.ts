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
import { Language } from '../../../models/enum-helpers/index.js';

import { EventData } from '../../../models/internal-models.js';
import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from './init-command-options.js';

export class InitCommand implements Command {
	public names = [Language.LL.commands.init.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.init.name(),
		description: Language.LL.commands.init.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: Language.LL.commands.init.start.name(),
				description: Language.LL.commands.init.start.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: Language.LL.commands.init.show.name(),
				description: Language.LL.commands.init.show.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: Language.LL.commands.init.next.name(),
				description: Language.LL.commands.init.next.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: Language.LL.commands.init.prev.name(),
				description: Language.LL.commands.init.prev.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: Language.LL.commands.init.jumpTo.name(),
				description: Language.LL.commands.init.jumpTo.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [{ ...InitOptions.INIT_CHARACTER_OPTION, required: true }],
			},
			{
				name: Language.LL.commands.init.join.name(),
				description: Language.LL.commands.init.join.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.SKILL_CHOICE_OPTION,
						description:
							Language.LL.commandOptions.skillChoice.overwrites.initJoinDescription(),
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
				name: Language.LL.commands.init.add.name(),
				description: Language.LL.commands.init.add.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
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
							Language.LL.commandOptions.rollExpression.overwrites.initAddDescription(),
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
				name: Language.LL.commands.init.set.name(),
				description: Language.LL.commands.init.set.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
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
				name: Language.LL.commands.init.remove.name(),
				description: Language.LL.commands.init.remove.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [{ ...InitOptions.INIT_CHARACTER_OPTION, required: true }],
			},
			{
				name: Language.LL.commands.init.statBlock.name(),
				description: Language.LL.commands.init.statBlock.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...InitOptions.INIT_CHARACTER_OPTION,
						required: true,
					},
					InitOptions.INIT_STAT_BLOCK_SECRET_OPTION,
				],
			},
			{
				name: Language.LL.commands.init.roll.name(),
				description: Language.LL.commands.init.roll.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
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
				name: Language.LL.commands.init.end.name(),
				description: Language.LL.commands.init.end.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
		],
	};
	public cooldown = new RateLimiter(1, 1000);
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
