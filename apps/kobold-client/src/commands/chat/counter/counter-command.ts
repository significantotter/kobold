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
import { L } from '../../../i18n/i18n-node.js';
import { CommandUtils } from '../../../utils/index.js';
import { InjectedServices } from '../../command.js';
import { Command, CommandDeferType } from '../../index.js';
import { CounterOptions } from './counter-command-options.js';

export class CounterCommand implements Command {
	public names = [L.en.commands.counter.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counter.name(),
		description: L.en.commands.counter.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.counter.list.name(),
				description: L.en.commands.counter.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.counter.display.name(),
				description: L.en.commands.counter.display.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.counter.create.name(),
				description: L.en.commands.counter.create.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					CounterOptions.COUNTER_NAME_OPTION,
					CounterOptions.COUNTER_DESCRIPTION_OPTION,
				],
			},
			{
				name: L.en.commands.counter.set.name(),
				description: L.en.commands.counter.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					CounterOptions.COUNTER_SET_OPTION_OPTION,
					CounterOptions.COUNTER_SET_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.counter.remove.name(),
				description: L.en.commands.counter.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterOptions.COUNTER_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
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
