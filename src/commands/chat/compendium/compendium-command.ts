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

import { CommandUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';
import { CompendiumOptions } from './compendium-command-options.js';
import L from '../../../i18n/i18n-node.js';
import { InjectedServices } from '../../command.js';

export class CompendiumCommand implements Command {
	public names = [L.en.commands.compendium.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.compendium.name(),
		description: L.en.commands.compendium.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.compendium.creature.name(),
				description: L.en.commands.compendium.creature.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [CompendiumOptions.COMPENDIUM_SEARCH_OPTION],
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
