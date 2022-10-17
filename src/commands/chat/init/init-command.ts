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

export class InitCommand implements Command {
	public names = ['init'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'init',
		description: `Initiative Tracking`,
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: 'start',
				description: 'Start initiative in the current channel.',
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: 'show',
				description: `Displays the current initiative`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: 'next',
				description: `Moves to the next participant in the initiative order`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: 'prev',
				description: `Moves to the previous participant in the initiative order`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
			{
				name: 'jump_to',
				description: `Jumps to a specific participant in the initiative order`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [ChatArgs.INIT_CHARACTER_OPTION],
			},
			{
				name: 'join',
				description:
					'Joins initiative with your active character. ' +
					'Defaults to rolling perception.',
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.SKILL_CHOICE_OPTION,
						description: 'The skill to use for initiative instead of perception.',
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
						...ChatArgs.INIT_VALUE_OPTION,
						required: false,
					},
				],
			},
			{
				name: 'add',
				description: `Adds a fake character to initiative`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.ACTOR_NAME_OPTION,
						required: true,
					},
					{
						...ChatArgs.ROLL_EXPRESSION_OPTION,
						description: 'Dice to roll to join initiative. ',
						required: false,
					},
					{
						...ChatArgs.INIT_VALUE_OPTION,
						required: false,
					},
				],
			},
			{
				name: 'set',
				description: `Sets certain properties of your character for initiative`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.INIT_CHARACTER_OPTION,
						required: true,
					},
					ChatArgs.ACTOR_SET_OPTION,
					ChatArgs.ACTOR_SET_VALUE_OPTION,
				],
			},
			{
				name: 'remove',
				description: 'Removes a character from initiative.',
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [ChatArgs.INIT_CHARACTER_OPTION],
			},
			{
				name: 'end',
				description: 'Ends the initiative in the current channel.',
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
			},
		],
	};
	public cooldown = new RateLimiter(1, 1000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionsString[] = [];

	constructor(private commands: Command[]) {}

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
			await InteractionUtils.send(intr, `Yip! Ran the base command!`);
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr, data);
		if (passesChecks) {
			await command.execute(intr, data, LL);
		}
	}
}
