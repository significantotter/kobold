import { CommandDocumentation } from '../helpers/commands.d.js';
import { counterCommandDefinition } from './counter.command-definition.js';

export const counterCommandDocumentation: CommandDocumentation<typeof counterCommandDefinition> = {
	name: 'counter',
	description: 'Custom counters to track xp, per-day abilities, etc.',
	subCommands: {
		list: {
			name: 'list',
			description: 'Lists all counters available to your active character.',
			usage: null,
			examples: [],
		},
		display: {
			name: 'display',
			description: 'Displays a counter for your active character.',
			usage: null,
			examples: [],
		},
		reset: {
			name: 'reset',
			description: 'Resets a counter for your active character.',
			usage: null,
			examples: [],
		},
		useSlot: {
			name: 'use-slot',
			description: 'Uses a prepared slot on a counter for your active character.',
			usage: null,
			examples: [],
		},
		value: {
			name: 'value',
			description: 'Changes the value of a counter for your active character.',
			usage: null,
			examples: [],
		},
		prepare: {
			name: 'prepare',
			description: "Prepares an expendable ability in a counter's slot.",
			usage: null,
			examples: [],
		},
		prepareMany: {
			name: 'prepare-many',
			description: "Prepares multiple expendable abilities in a counter's slots.",
			usage: null,
			examples: [],
		},
		create: {
			name: 'create',
			description: 'Creates a counter for the active character.',
			usage: null,
			examples: [],
		},
		set: {
			name: 'set',
			description: 'Sets the value of a counter for your active character.',
			usage: null,
			examples: [],
		},
		remove: {
			name: 'remove',
			description: 'Removes a counter for the active character.',
			usage: null,
			examples: [],
		},
	},
};
