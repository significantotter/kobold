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

import { CommandUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { GameOptions } from './game-command-options.js';
import { InitOptions } from '../init/init-command-options.js';
import L from '../../../i18n/i18n-node.js';

export class GameCommand implements Command {
	public names = [L.en.commands.game.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.game.name(),
		description: L.en.commands.game.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.game.manage.name(),
				description: L.en.commands.game.manage.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [GameOptions.GAME_MANAGE_OPTION, GameOptions.GAME_MANAGE_VALUE],
			},
			{
				name: L.en.commands.game.init.name(),
				description: L.en.commands.game.init.description(),
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
					GameOptions.GAME_TARGET_CHARACTER,
				],
			},
			{
				name: L.en.commands.game.roll.name(),
				description: L.en.commands.game.roll.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameOptions.GAME_ROLL_TYPE,
					GameOptions.GAME_DICE_ROLL_OR_MODIFIER,
					GameOptions.GAME_TARGET_CHARACTER,
					{ ...InitOptions.INIT_CHARACTER_TARGET, required: false },
					ChatArgs.ROLL_SECRET_OPTION,
				],
			},
			{
				name: L.en.commands.game.list.name(),
				description: L.en.commands.game.list.description(),
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

		const passesChecks = await CommandUtils.runChecks(command, intr);
		if (passesChecks) {
			await command.execute(intr, LL);
		}
	}
}
