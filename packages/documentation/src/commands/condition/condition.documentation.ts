import { CommandDocumentation } from '../helpers/commands.d.js';
import { conditionCommandDefinition } from './condition.command-definition.js';

export const conditionCommandDocumentation: CommandDocumentation<
	typeof conditionCommandDefinition
> = {
	name: 'condition',
	description: 'Commands for applying conditions to characters or creatures.',
	subCommands: {
		'apply-custom': {
			name: 'apply-custom',
			description: 'Applies a custom condition to a target',
			usage: null,
			examples: [],
		},
		'apply-modifier': {
			name: 'apply-modifier',
			description: 'Applies your existing modifier to a target as a condition',
			usage: null,
			examples: [],
		},
		list: {
			name: 'list',
			description: "Lists all of a character's conditions",
			usage: null,
			examples: [],
		},
		set: {
			name: 'set',
			description: 'Sets a property of a condition on a target',
			usage: null,
			examples: [],
		},
		remove: {
			name: 'remove',
			description: 'Removes a condition from a target',
			usage: null,
			examples: [],
		},
		severity: {
			name: 'severity',
			description: 'Changes the severity of a condition on a target',
			usage: null,
			examples: [],
		},
	},
};
