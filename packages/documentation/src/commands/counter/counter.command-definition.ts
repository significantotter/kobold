import { APIApplicationCommandOption, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.d.ts';
import { CounterCommandOptionEnum, counterCommandOptions } from './counter.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum CounterSubCommandEnum {
	list = 'list',
	display = 'display',
	reset = 'reset',
	useSlot = 'use-slot',
	value = 'value',
	prepare = 'prepare',
	prepareMany = 'prepare-many',
	create = 'create',
	set = 'set',
	remove = 'remove',
}

export const counterCommandDefinition = {
	metadata: {
		name: 'counter',
		description: 'Custom counters to track xp, per-day abilities, etc.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[CounterSubCommandEnum.list]: {
			name: CounterSubCommandEnum.list,
			description: 'Lists all counters available to your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterListHideGroups]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterListHideGroups],
					1
				),
			},
		},
		[CounterSubCommandEnum.display]: {
			name: CounterSubCommandEnum.display,
			description: 'Displays a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: withOrder(
					{
						...counterCommandOptions[CounterCommandOptionEnum.counterName],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
		[CounterSubCommandEnum.reset]: {
			name: CounterSubCommandEnum.reset,
			description: 'Resets a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: withOrder(
					{
						...counterCommandOptions[CounterCommandOptionEnum.counterName],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
		[CounterSubCommandEnum.useSlot]: {
			name: CounterSubCommandEnum.useSlot,
			description: 'Uses a prepared slot on a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: withOrder(
					{
						...counterCommandOptions[CounterCommandOptionEnum.counterName],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
				[CounterCommandOptionEnum.counterSlot]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterSlot],
					2
				),
				[CounterCommandOptionEnum.counterResetSlot]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterResetSlot],
					3
				),
			},
		},
		[CounterSubCommandEnum.value]: {
			name: CounterSubCommandEnum.value,
			description: 'Changes the value of a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: withOrder(
					{
						...counterCommandOptions[CounterCommandOptionEnum.counterName],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
				[CounterCommandOptionEnum.counterValue]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterValue],
					2
				),
			},
		},
		[CounterSubCommandEnum.prepare]: {
			name: CounterSubCommandEnum.prepare,
			description: "Prepares an expendable ability in a counter's slot.",
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: withOrder(
					{
						...counterCommandOptions[CounterCommandOptionEnum.counterName],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
				[CounterCommandOptionEnum.counterSlot]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterSlot],
					2
				),
				[CounterCommandOptionEnum.counterPrepareSlot]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterPrepareSlot],
					3
				),
			},
		},
		[CounterSubCommandEnum.prepareMany]: {
			name: CounterSubCommandEnum.prepareMany,
			description: "Prepares multiple expendable abilities in a counter's slots.",
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: withOrder(
					{
						...counterCommandOptions[CounterCommandOptionEnum.counterName],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
				[CounterCommandOptionEnum.counterPrepareMany]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterPrepareMany],
					2
				),
				[CounterCommandOptionEnum.counterPrepareFresh]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterPrepareFresh],
					3
				),
			},
		},
		[CounterSubCommandEnum.create]: {
			name: CounterSubCommandEnum.create,
			description: 'Creates a counter for the active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterStyle]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterStyle],
					1
				),
				[CounterCommandOptionEnum.counterName]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterName],
					2
				),
				[CounterCommandOptionEnum.counterMax]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterMax],
					3
				),
				[CounterCommandOptionEnum.counterCounterGroupName]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterCounterGroupName],
					4
				),
				[CounterCommandOptionEnum.counterRecoverable]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterRecoverable],
					5
				),
				[CounterCommandOptionEnum.counterRecoverTo]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterRecoverTo],
					6
				),
			},
		},
		[CounterSubCommandEnum.set]: {
			name: CounterSubCommandEnum.set,
			description: 'Sets the value of a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: withOrder(
					{
						...counterCommandOptions[CounterCommandOptionEnum.counterName],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
				[CounterCommandOptionEnum.counterSetOption]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterSetOption],
					2
				),
				[CounterCommandOptionEnum.counterSetValue]: withOrder(
					counterCommandOptions[CounterCommandOptionEnum.counterSetValue],
					3
				),
			},
		},
		[CounterSubCommandEnum.remove]: {
			name: CounterSubCommandEnum.remove,
			description: 'Removes a counter for the active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: withOrder(
					{
						...counterCommandOptions[CounterCommandOptionEnum.counterName],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
	},
} satisfies CommandDefinition<CounterSubCommandEnum>;
