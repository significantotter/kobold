import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.d.ts';
import {
	CompendiumCommandOptionEnum,
	compendiumCommandOptions,
} from './compendium.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum CompendiumSubCommandEnum {
	search = 'search',
}
export const compendiumCommandDefinition = {
	metadata: {
		name: 'compendium',
		description: 'Commands for fetching information about PF2E.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[CompendiumSubCommandEnum.search]: {
			name: CompendiumSubCommandEnum.search,
			description: 'Fetches pathfinder 2E stat-blocks or rules information',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CompendiumCommandOptionEnum.search]: withOrder(
					compendiumCommandOptions[CompendiumCommandOptionEnum.search],
					1
				),
			},
		},
	},
} satisfies CommandDefinition<CompendiumSubCommandEnum>;
