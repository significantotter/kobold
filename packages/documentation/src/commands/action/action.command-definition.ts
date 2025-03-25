import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.d.js';
import { ActionCommandOptionEnum, actionCommandOptions } from './action.command-options.js';

const OptionEnum = ActionCommandOptionEnum;

export enum ActionSubCommandEnum {
	list = 'list',
	detail = 'detail',
	create = 'create',
	remove = 'remove',
	set = 'set',
	import = 'import',
	export = 'export',
}

export const actionCommandDefinition = {
	metadata: {
		name: 'action',
		description: 'Commands for creating and modifying custom, rollable actions.',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[ActionSubCommandEnum.list]: {
			name: ActionSubCommandEnum.list,
			description: "Lists all of your character's actions.",
			type: ApplicationCommandOptionType.Subcommand,
			options: {},
		},
		[ActionSubCommandEnum.detail]: {
			name: ActionSubCommandEnum.detail,
			description: 'Describes a specific action.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[OptionEnum.targetAction]: actionCommandOptions[OptionEnum.targetAction],
			},
		},
		[ActionSubCommandEnum.create]: {
			type: ApplicationCommandType.ChatInput,
			name: ActionSubCommandEnum.create,
			description: 'Creates an action.',
			dm_permission: true,
			default_member_permissions: undefined,
			options: {
				[OptionEnum.name]: actionCommandOptions[OptionEnum.name],
				[OptionEnum.type]: actionCommandOptions[OptionEnum.type],
				[OptionEnum.actionCost]: actionCommandOptions[OptionEnum.actionCost],
				[OptionEnum.description]: actionCommandOptions[OptionEnum.description],
				[OptionEnum.baseLevel]: actionCommandOptions[OptionEnum.baseLevel],
				[OptionEnum.autoHeighten]: actionCommandOptions[OptionEnum.autoHeighten],
				[OptionEnum.tags]: actionCommandOptions[OptionEnum.tags],
			},
		},
		[ActionSubCommandEnum.remove]: {
			name: ActionSubCommandEnum.remove,
			description: 'Removes an action',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[OptionEnum.targetAction]: {
					...actionCommandOptions[OptionEnum.targetAction],
					autocomplete: true,
					choices: undefined,
				},
			},
		},
		[ActionSubCommandEnum.set]: {
			name: ActionSubCommandEnum.set,
			description: 'Sets a field on an action. "none" clears the field.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[OptionEnum.targetAction]: actionCommandOptions[OptionEnum.targetAction],
				[OptionEnum.setOption]: actionCommandOptions[OptionEnum.setOption],
				[OptionEnum.setValue]: actionCommandOptions[OptionEnum.setValue],
			},
		},
		[ActionSubCommandEnum.import]: {
			name: ActionSubCommandEnum.import,
			description: 'Imports a list of action data to a character from PasteBin.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[OptionEnum.url]: actionCommandOptions[OptionEnum.url],
				[OptionEnum.importMode]: actionCommandOptions[OptionEnum.importMode],
			},
		},
		[ActionSubCommandEnum.export]: {
			name: ActionSubCommandEnum.export,
			description: 'Exports actions to a PasteBin url.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {},
		},
	},
} satisfies CommandDefinition<ActionSubCommandEnum>;
