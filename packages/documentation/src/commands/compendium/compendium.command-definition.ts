import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import {
	CompendiumCommandOptionEnum,
	compendiumCommandOptions,
} from './compendium.command-options.js';

export enum CompendiumSubCommandEnum {
	search = 'search',
}
export const compendiumCommandDefinition = {
	metadata: {
		name: 'compendium',
		description: 'Commands for fetching information about PF2E.',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[CompendiumSubCommandEnum.search]: {
			name: 'search',
			description: 'Fetches pathfinder 2E stat-blocks or rules information',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CompendiumCommandOptionEnum.search]:
					compendiumCommandOptions[CompendiumCommandOptionEnum.search],
			},
		},
	},
} satisfies CommandDefinition<CompendiumSubCommandEnum>;
