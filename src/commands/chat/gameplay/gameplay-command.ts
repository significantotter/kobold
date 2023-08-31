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
import { TranslationFunctions } from '../../../i18n/i18n-types.js';

import { EventData } from '../../../models/internal-models.js';
import { CommandUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { GameplayOptions } from './gameplay-command-options.js';
import { ChatArgs } from '../../../constants/chat-args.js';

export class GameplayCommand implements Command {
	public names = [Language.LL.commands.gameplay.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: Language.LL.commands.gameplay.name(),
		description: Language.LL.commands.gameplay.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: Language.LL.commands.gameplay.damage.name(),
				description: Language.LL.commands.gameplay.damage.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{ ...GameplayOptions.GAMEPLAY_TARGET_CHARACTER, required: true },
					GameplayOptions.GAMEPLAY_DAMAGE_AMOUNT,
					GameplayOptions.GAMEPLAY_DAMAGE_TYPE,
				],
			},
			{
				name: Language.LL.commands.gameplay.set.name(),
				description: Language.LL.commands.gameplay.set.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					GameplayOptions.GAMEPLAY_SET_OPTION,
					GameplayOptions.GAMEPLAY_SET_VALUE,
					GameplayOptions.GAMEPLAY_TARGET_CHARACTER,
				],
			},
			{
				name: Language.LL.commands.gameplay.recover.name(),
				description: Language.LL.commands.gameplay.recover.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [GameplayOptions.GAMEPLAY_TARGET_CHARACTER],
			},
			{
				name: Language.LL.commands.gameplay.tracker.name(),
				description: Language.LL.commands.gameplay.tracker.description(),
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
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
