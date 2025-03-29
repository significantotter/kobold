import { ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import { CounterCommandOptionEnum, counterCommandOptions } from './counter.command-options.js';

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
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[CounterSubCommandEnum.list]: {
			name: CounterSubCommandEnum.list,
			description: 'Lists all counters available to your active character.',
			type: ApplicationCommandType.ChatInput,
			options: {
				[CounterCommandOptionEnum.counterListHideGroups]:
					counterCommandOptions[CounterCommandOptionEnum.counterListHideGroups],
			},
		},
		[CounterSubCommandEnum.display]: {
			name: CounterSubCommandEnum.display,
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
		[CounterSubCommandEnum.reset]: {
			name: CounterSubCommandEnum.reset,
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
		[CounterSubCommandEnum.useSlot]: {
			name: CounterSubCommandEnum.useSlot,
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
		[CounterSubCommandEnum.value]: {
			name: CounterSubCommandEnum.value,
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
		[CounterSubCommandEnum.prepare]: {
			name: CounterSubCommandEnum.prepare,
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
		[CounterSubCommandEnum.prepareMany]: {
			name: CounterSubCommandEnum.prepareMany,
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
		[CounterSubCommandEnum.create]: {
			name: CounterSubCommandEnum.create,
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
		[CounterSubCommandEnum.set]: {
			name: CounterSubCommandEnum.set,
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
		[CounterSubCommandEnum.remove]: {
			name: CounterSubCommandEnum.remove,
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
