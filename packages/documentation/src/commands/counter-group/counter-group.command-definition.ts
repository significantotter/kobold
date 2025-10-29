import {
	APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.d.ts';
import {
	CounterGroupCommandOptionEnum,
	counterGroupCommandOptions,
} from './counter-group.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum CounterGroupSubCommandEnum {
	list = 'list',
	display = 'display',
	reset = 'reset',
	create = 'create',
	set = 'set',
	remove = 'remove',
}

export const counterGroupCommandDefinition = {
	metadata: {
		name: 'counter-group',
		description: 'Groups of related counters.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[CounterGroupSubCommandEnum.list]: {
			name: CounterGroupSubCommandEnum.list,
			description: 'Lists all counter groups available to your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {},
		},
		[CounterGroupSubCommandEnum.display]: {
			name: CounterGroupSubCommandEnum.display,
			description: 'Displays a counter group for your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]: withOrder(
					{
						...counterGroupCommandOptions[
							CounterGroupCommandOptionEnum.counterGroupName
						],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
		[CounterGroupSubCommandEnum.reset]: {
			name: CounterGroupSubCommandEnum.reset,
			description: "Resets all counters within a character's counter group.",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]: withOrder(
					{
						...counterGroupCommandOptions[
							CounterGroupCommandOptionEnum.counterGroupName
						],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
		[CounterGroupSubCommandEnum.create]: {
			name: CounterGroupSubCommandEnum.create,
			description: 'Creates a counter group for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]: withOrder(
					counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupName],
					1
				),
				[CounterGroupCommandOptionEnum.counterGroupDescription]: withOrder(
					counterGroupCommandOptions[
						CounterGroupCommandOptionEnum.counterGroupDescription
					],
					2
				),
			},
		},
		[CounterGroupSubCommandEnum.set]: {
			name: CounterGroupSubCommandEnum.set,
			description: 'Sets the value of a counter group for your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]: withOrder(
					{
						...counterGroupCommandOptions[
							CounterGroupCommandOptionEnum.counterGroupName
						],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
				[CounterGroupCommandOptionEnum.counterGroupSetOption]: withOrder(
					counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupSetOption],
					2
				),
				[CounterGroupCommandOptionEnum.counterGroupSetValue]: withOrder(
					counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupSetValue],
					3
				),
			},
		},
		[CounterGroupSubCommandEnum.remove]: {
			name: CounterGroupSubCommandEnum.remove,
			description: 'Removes a counter group for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]: withOrder(
					{
						...counterGroupCommandOptions[
							CounterGroupCommandOptionEnum.counterGroupName
						],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
	},
} satisfies CommandDefinition<CounterGroupSubCommandEnum>;
