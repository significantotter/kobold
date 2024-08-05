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
import { CounterGroupOptions } from './counter-group-command-options.js';

export class CounterGroupCommand implements Command {
	public names = [L.en.commands.counterGroup.name()];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.counterGroup.name(),
		description: L.en.commands.counterGroup.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.counterGroup.list.name(),
				description: L.en.commands.counterGroup.list.description(),
				type: ApplicationCommandOptionType.Subcommand,
			},
			{
				name: L.en.commands.counterGroup.display.name(),
				description: L.en.commands.counterGroup.display.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterGroupOptions.COUNTER_GROUP_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.counterGroup.create.name(),
				description: L.en.commands.counterGroup.create.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					CounterGroupOptions.COUNTER_GROUP_NAME_OPTION,
					CounterGroupOptions.COUNTER_GROUP_DESCRIPTION_OPTION,
				],
			},
			{
				name: L.en.commands.counterGroup.set.name(),
				description: L.en.commands.counterGroup.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterGroupOptions.COUNTER_GROUP_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
					CounterGroupOptions.COUNTER_GROUP_SET_OPTION_OPTION,
					CounterGroupOptions.COUNTER_GROUP_SET_VALUE_OPTION,
				],
			},
			{
				name: L.en.commands.counterGroup.reset.name(),
				description: L.en.commands.counterGroup.reset.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterGroupOptions.COUNTER_GROUP_NAME_OPTION,
						autocomplete: true,
						choices: undefined,
					},
				],
			},
			{
				name: L.en.commands.counterGroup.remove.name(),
				description: L.en.commands.counterGroup.remove.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [
					{
						...CounterGroupOptions.COUNTER_GROUP_NAME_OPTION,
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
