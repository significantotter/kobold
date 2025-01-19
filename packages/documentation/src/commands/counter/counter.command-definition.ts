import { ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import { CounterCommandOptionEnum, counterCommandOptions } from './counter.command-options.js';

export enum CounterSubCommandEnum {
	list = 'list',
	display = 'display',
	reset = 'reset',
	useSlot = 'useSlot',
	value = 'value',
	prepare = 'prepare',
	prepareMany = 'prepareMany',
	create = 'create',
	set = 'set',
	remove = 'remove',
}

export const counterCommandDefinition = {
	metadata: {
		name: 'counter',
		description: 'Custom counters to track xp, per-day abilities, etc.',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		list: {
			name: 'list',
			description: 'Lists all counters available to your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterListHideGroups]:
					counterCommandOptions[CounterCommandOptionEnum.counterListHideGroups],
			},
		},
		display: {
			name: 'display',
			description: 'Displays a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: {
					...counterCommandOptions[CounterCommandOptionEnum.counterName],
					autocomplete: true,
					choices: undefined,
				},
			},
		},
		reset: {
			name: 'reset',
			description: 'Resets a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: {
					...counterCommandOptions[CounterCommandOptionEnum.counterName],
					autocomplete: true,
					choices: undefined,
				},
			},
		},
		useSlot: {
			name: 'use-slot',
			description: 'Uses a prepared slot on a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: {
					...counterCommandOptions[CounterCommandOptionEnum.counterName],
					autocomplete: true,
					choices: undefined,
				},
				[CounterCommandOptionEnum.counterSlot]:
					counterCommandOptions[CounterCommandOptionEnum.counterSlot],
				[CounterCommandOptionEnum.counterResetSlot]:
					counterCommandOptions[CounterCommandOptionEnum.counterResetSlot],
			},
		},
		value: {
			name: 'value',
			description: 'Changes the value of a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: {
					...counterCommandOptions[CounterCommandOptionEnum.counterName],
					autocomplete: true,
					choices: undefined,
				},
				[CounterCommandOptionEnum.counterValue]:
					counterCommandOptions[CounterCommandOptionEnum.counterValue],
			},
		},
		prepare: {
			name: 'prepare',
			description: "Prepares an expendable ability in a counter's slot.",
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: {
					...counterCommandOptions[CounterCommandOptionEnum.counterName],
					autocomplete: true,
					choices: undefined,
				},
				[CounterCommandOptionEnum.counterSlot]:
					counterCommandOptions[CounterCommandOptionEnum.counterSlot],
				[CounterCommandOptionEnum.counterPrepareSlot]:
					counterCommandOptions[CounterCommandOptionEnum.counterPrepareSlot],
			},
		},
		prepareMany: {
			name: 'prepare-many',
			description: "Prepares multiple expendable abilities in a counter's slots.",
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: {
					...counterCommandOptions[CounterCommandOptionEnum.counterName],
					autocomplete: true,
					choices: undefined,
				},
				[CounterCommandOptionEnum.counterPrepareMany]:
					counterCommandOptions[CounterCommandOptionEnum.counterPrepareMany],
				[CounterCommandOptionEnum.counterPrepareFresh]:
					counterCommandOptions[CounterCommandOptionEnum.counterPrepareFresh],
			},
		},
		create: {
			name: 'create',
			description: 'Creates a counter for the active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterStyle]:
					counterCommandOptions[CounterCommandOptionEnum.counterStyle],
				[CounterCommandOptionEnum.counterName]:
					counterCommandOptions[CounterCommandOptionEnum.counterName],
				[CounterCommandOptionEnum.counterMax]:
					counterCommandOptions[CounterCommandOptionEnum.counterMax],
				[CounterCommandOptionEnum.counterCounterGroupName]:
					counterCommandOptions[CounterCommandOptionEnum.counterCounterGroupName],
				[CounterCommandOptionEnum.counterRecoverable]:
					counterCommandOptions[CounterCommandOptionEnum.counterRecoverable],
				[CounterCommandOptionEnum.counterRecoverTo]:
					counterCommandOptions[CounterCommandOptionEnum.counterRecoverTo],
			},
		},
		set: {
			name: 'set',
			description: 'Sets the value of a counter for your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: {
					...counterCommandOptions[CounterCommandOptionEnum.counterName],
					autocomplete: true,
					choices: undefined,
				},
				[CounterCommandOptionEnum.counterSetOption]:
					counterCommandOptions[CounterCommandOptionEnum.counterSetOption],
				[CounterCommandOptionEnum.counterSetValue]:
					counterCommandOptions[CounterCommandOptionEnum.counterSetValue],
			},
		},
		remove: {
			name: 'remove',
			description: 'Removes a counter for the active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterName]: {
					...counterCommandOptions[CounterCommandOptionEnum.counterName],
					autocomplete: true,
					choices: undefined,
				},
			},
		},
	},
} satisfies CommandDefinition<CounterSubCommandEnum>;
