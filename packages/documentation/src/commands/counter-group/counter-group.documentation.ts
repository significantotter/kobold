import { CommandDocumentation } from '../helpers/commands.d.js';
import { counterGroupCommandDefinition } from './counter-group.command-definition.js';

export const counterGroupCommandDocumentation: CommandDocumentation<
	typeof counterGroupCommandDefinition
> = {
	name: 'counterGroup',
	description: 'Groups of related counters.',
	subCommands: {
		list: {
			name: 'list',
			description: 'Lists all counters available to your active character.',
			usage: null,
			examples: [],
		},
		display: {
			name: 'display',
			description: 'Displays a counter group for your active character.',
			usage: null,
			examples: [],
		},
		reset: {
			name: 'reset',
			description: "Resets all counters within a character's counter group.",
			usage: null,
			examples: [],
		},
		create: {
			name: 'create',
			description: 'Creates a counter group for the active character.',
			usage: null,
			examples: [],
		},
		set: {
			name: 'set',
			description: 'Sets a field within a counter group.',
			usage: null,
			examples: [],
		},
		remove: {
			name: 'remove',
			description: 'Removes a counter group from the active character.',
			usage: null,
			examples: [],
		},
	},
};
