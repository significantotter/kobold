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

import { ChatArgs } from '../../../constants/chat-args.js';
import L from '../../../i18n/i18n-node.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';
import { GameplayOptions } from './gameplay-command-options.js';

export class GameplayCommand implements Command {
	public name = L.en.commands.gameplay.name();
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.gameplay.name(),
		description: L.en.commands.gameplay.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.gameplay.damage.name(),
				description: L.en.commands.gameplay.damage.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{ ...GameplayOptions.GAMEPLAY_TARGET_CHARACTER, required: true },
					GameplayOptions.GAMEPLAY_DAMAGE_AMOUNT,
					GameplayOptions.GAMEPLAY_DAMAGE_TYPE,
				],
			},
			{
				name: L.en.commands.gameplay.set.name(),
				description: L.en.commands.gameplay.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					GameplayOptions.GAMEPLAY_SET_OPTION,
					GameplayOptions.GAMEPLAY_SET_VALUE,
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
				],
			},
			{
				name: L.en.commands.gameplay.recover.name(),
				description: L.en.commands.gameplay.recover.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [GameplayOptions.GAMEPLAY_TARGET_CHARACTER],
			},
			{
				name: L.en.commands.gameplay.tracker.name(),
				description: L.en.commands.gameplay.tracker.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{ ...ChatArgs.SET_ACTIVE_NAME_OPTION, required: false },
					GameplayOptions.GAMEPLAY_TARGET_CHANNEL,
					GameplayOptions.GAMEPLAY_TRACKER_MODE,
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
