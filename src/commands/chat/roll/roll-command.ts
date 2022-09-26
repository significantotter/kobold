import {
	ApplicationCommandOptionType,
	ApplicationCommandType,
	RESTPostAPIChatInputApplicationCommandsJSONBody,
} from 'discord-api-types/v10';
import {
	AutocompleteFocusedOption,
	AutocompleteInteraction,
	CacheType,
	CommandInteraction,
	PermissionString,
} from 'discord.js';
import { RateLimiter } from 'discord.js-rate-limiter';
import { ChatArgs } from '../../../constants/chat-args.js';

import { EventData } from '../../../models/internal-models.js';
import { CommandUtils, InteractionUtils } from '../../../utils/index.js';
import { Command, CommandDeferType } from '../../index.js';

export class RollCommand implements Command {
	public names = ['roll'];
	public metadata: RESTPostAPIChatInputApplicationCommandsJSONBody = {
		type: ApplicationCommandType.ChatInput,
		name: 'roll',
		description: `Roll Dice`,
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: 'ability',
				description: `rolls an ability for your active character`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.ABILITY_CHOICE_OPTION,
						required: true,
					},
					{
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
				],
			},
			{
				name: 'attack',
				description: `rolls an attack for your active character`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.ATTACK_CHOICE_OPTION,
						required: true,
					},
					{
						...ChatArgs.ATTACK_ROLL_MODIFIER_OPTION,
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
				],
			},
			{
				name: 'dice',
				description: `Rolls some dice.`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.ROLL_EXPRESSION_OPTION,
						required: true,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
				],
			},
			{
				name: 'perception',
				description: `rolls perception for your active character`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
				],
			},
			{
				name: 'save',
				description: `rolls a save for your active character`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.SAVE_CHOICE_OPTION,
						required: true,
					},
					{
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
				],
			},
			{
				name: 'skill',
				description: `rolls a skill for your active character`,
				type: ApplicationCommandOptionType.Subcommand.valueOf(),
				options: [
					{
						...ChatArgs.SKILL_CHOICE_OPTION,
						required: true,
					},
					{
						...ChatArgs.ROLL_MODIFIER_OPTION,
						required: false,
					},
					{
						...ChatArgs.ROLL_NOTE_OPTION,
						required: false,
					},
				],
			},
		],
	};
	public cooldown = new RateLimiter(1, 5000);
	public deferType = CommandDeferType.PUBLIC;
	public requireClientPerms: PermissionString[] = [];

	constructor(private commands: Command[]) {}

	public async autocomplete(
		intr: AutocompleteInteraction<CacheType>,
		option: AutocompleteFocusedOption
	): Promise<void> {
		if (!intr.isAutocomplete()) return;

		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command || !command.autocomplete) {
			return;
		}

		await command.autocomplete(intr, option);
	}

	public async execute(intr: CommandInteraction, data: EventData): Promise<void> {
		let command = CommandUtils.getSubCommandByName(this.commands, intr.options.getSubcommand());
		if (!command) {
			return;
		}

		let passesChecks = await CommandUtils.runChecks(command, intr, data);
		if (passesChecks) {
			await command.execute(intr, data);
		}
	}
}
