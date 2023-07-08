import { Language } from './../../../models/enum-helpers/language';
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

import { EventData } from '../../../models/internal-models.js';
import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { GameOptions } from './game-command-options.js';
import { InitOptions } from '../init/init-command-options.js';

export class GameCommand implements Command {
	public names = [Language.LL.commands.game.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.game.name(),
		description: Language.LL.commands.game.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: Language.LL.commands.game.manage.name(),
				description: Language.LL.commands.game.manage.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [GameOptions.GAME_MANAGE_OPTION, GameOptions.GAME_MANAGE_VALUE],
			},
			{
				name: Language.LL.commands.game.init.name(),
				description: Language.LL.commands.game.init.description(),
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
					GameOptions.GAME_TARGET_CHARACTER,
				],
			},
			{
				name: Language.LL.commands.game.roll.name(),
				description: Language.LL.commands.game.roll.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					GameOptions.GAME_ROLL_TYPE,
					GameOptions.GAME_DICE_ROLL_OR_MODIFIER,
					GameOptions.GAME_TARGET_CHARACTER,
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: false },
					ChatArgs.ROLL_SECRET_OPTION,
				],
			},
			{
				name: Language.LL.commands.game.list.name(),
				description: Language.LL.commands.game.list.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
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
