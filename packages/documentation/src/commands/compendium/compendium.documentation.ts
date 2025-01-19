import { CommandDocumentation, CommandResponseTypeEnum } from '../helpers/commands.d.js';
import { compendiumCommandDefinition } from './compendium.command-definition.js';

export const compendiumCommandDocumentation: CommandDocumentation<
	typeof compendiumCommandDefinition
> = {
	name: 'compendium',
	description: 'Commands for fetching information about PF2E.',
	subCommands: {
		search: {
			name: 'search',
			description: 'Fetches pathfinder 2E stat-blocks or rules information',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'TODO: Here is the information you requested.',
					options: {
						search: 'goblin',
					},
				},
			],
		},
	},
};
