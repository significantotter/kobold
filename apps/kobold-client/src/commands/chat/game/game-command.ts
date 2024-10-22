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
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

import L from '../../../i18n/i18n-node.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';
import { InitOptions } from '../init/init-command-options.js';
import { GameOptions } from './game-command-options.js';

export class GameCommand implements Command {
	public name = L.en.commands.game.name();
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
					GameOptions.GAME_TARGET_CHARACTER,
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
				],
			},
			{
				name: L.en.commands.game.partyStatus.name(),
				description: L.en.commands.game.partyStatus.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [GameOptions.GAME_TARGET_CHARACTER, GameOptions.GAME_SHEET_STYLE],
			},
			{
				name: L.en.commands.game.give.name(),
				description: L.en.commands.game.give.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameOptions.GAME_TARGET_CHARACTER,
					GameOptions.GAME_GIVE_OPTION,
					GameOptions.GAME_GIVE_AMOUNT,
				],
			},
			{
				name: L.en.commands.game.roll.name(),
				description: L.en.commands.game.roll.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameOptions.GAME_TARGET_CHARACTER,
					GameOptions.GAME_ROLL_TYPE,
					GameOptions.GAME_DICE_ROLL_OR_MODIFIER,
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
