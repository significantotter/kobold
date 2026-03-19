import type { CommandDocumentation } from '../helpers/commands.types.js';
import { minionCommandDefinition, MinionSubCommandEnum } from './minion.command-definition.js';

export const minionCommandDocumentation: CommandDocumentation<typeof minionCommandDefinition> = {
	name: 'minion',
	description: 'Minions that join combat under control of a character.',
	subCommands: {
		[MinionSubCommandEnum.update]: {
			name: MinionSubCommandEnum.update,
			description: 'Update a minion',
			usage: null,
			examples: [],
		},
		[MinionSubCommandEnum.create]: {
			name: MinionSubCommandEnum.create,
			description: 'Create a minion',
			usage: null,
			examples: [],
		},
		// [MinionSubCommandEnum.assign]: {
		// 	name: MinionSubCommandEnum.assign,
		// 	description: 'Assign a minion to a character',
		// 	usage: null,
		// 	examples: [],
		// },
		[MinionSubCommandEnum.sheet]: {
			name: MinionSubCommandEnum.sheet,
			description: "Display a minion's sheet",
			usage: null,
			examples: [],
		},
		[MinionSubCommandEnum.list]: {
			name: MinionSubCommandEnum.list,
			description: 'List minions',
			usage: null,
			examples: [],
		},
		[MinionSubCommandEnum.remove]: {
			name: MinionSubCommandEnum.remove,
			description: 'Remove a minion',
			usage: null,
			examples: [],
		},
		[MinionSubCommandEnum.roll]: {
			name: MinionSubCommandEnum.roll,
			description: 'Roll a minion action',
			usage: null,
			examples: [],
		},
		[MinionSubCommandEnum.set]: {
			name: MinionSubCommandEnum.set,
			description: 'Set a minion value',
			usage: null,
			examples: [],
		},
	},
};
