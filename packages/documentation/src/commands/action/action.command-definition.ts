import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.types.js';
import { ActionCommandOptionEnum, actionCommandOptions } from './action.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';
import { CommandDeferType } from '../helpers.js';

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
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[ActionSubCommandEnum.list]: {
			name: ActionSubCommandEnum.list,
			description: "Lists all of your character's actions.",
			type: ApplicationCommandOptionType.Subcommand,
			deferType: CommandDeferType.NONE,
			options: {},
		},
		[ActionSubCommandEnum.detail]: {
			name: ActionSubCommandEnum.detail,
			description: 'Describes a specific action.',
			type: ApplicationCommandOptionType.Subcommand,
			deferType: CommandDeferType.NONE,
			options: {
				[OptionEnum.targetAction]: withOrder(
					actionCommandOptions[OptionEnum.targetAction],
					1
				),
			},
		},
		[ActionSubCommandEnum.create]: {
			type: ApplicationCommandType.ChatInput,
			name: ActionSubCommandEnum.create,
			description: 'Creates an action.',
			contexts: anyUsageContext,
			default_member_permissions: undefined,
			options: {
				[OptionEnum.name]: withOrder(actionCommandOptions[OptionEnum.name], 1),
				[OptionEnum.type]: withOrder(actionCommandOptions[OptionEnum.type], 2),
				[OptionEnum.actionCost]: withOrder(actionCommandOptions[OptionEnum.actionCost], 3),
				[OptionEnum.description]: withOrder(
					actionCommandOptions[OptionEnum.description],
					4
				),
				[OptionEnum.baseLevel]: withOrder(actionCommandOptions[OptionEnum.baseLevel], 5),
				[OptionEnum.autoHeighten]: withOrder(
					actionCommandOptions[OptionEnum.autoHeighten],
					6
				),
				[OptionEnum.tags]: withOrder(actionCommandOptions[OptionEnum.tags], 7),
			},
		},
		[ActionSubCommandEnum.remove]: {
			name: ActionSubCommandEnum.remove,
			description: 'Removes an action',
			type: ApplicationCommandOptionType.Subcommand,
			deferType: CommandDeferType.NONE,
			options: {
				[OptionEnum.targetAction]: withOrder(
					{
						...actionCommandOptions[OptionEnum.targetAction],
						autocomplete: true,
						choices: undefined,
					},
					1
				),
			},
		},
		[ActionSubCommandEnum.set]: {
			name: ActionSubCommandEnum.set,
			description: 'Sets a field on an action. "none" clears the field.',
			type: ApplicationCommandOptionType.Subcommand,
			deferType: CommandDeferType.NONE,
			options: {
				[OptionEnum.targetAction]: withOrder(
					actionCommandOptions[OptionEnum.targetAction],
					1
				),
				[OptionEnum.setOption]: withOrder(actionCommandOptions[OptionEnum.setOption], 2),
				[OptionEnum.setValue]: withOrder(actionCommandOptions[OptionEnum.setValue], 3),
			},
		},
		[ActionSubCommandEnum.import]: {
			name: ActionSubCommandEnum.import,
			description: 'Imports a list of action data to a character from PasteBin.',
			type: ApplicationCommandOptionType.Subcommand,
			deferType: CommandDeferType.NONE,
			options: {
				[OptionEnum.url]: withOrder(actionCommandOptions[OptionEnum.url], 1),
				[OptionEnum.importMode]: withOrder(actionCommandOptions[OptionEnum.importMode], 2),
			},
		},
		[ActionSubCommandEnum.export]: {
			name: ActionSubCommandEnum.export,
			description: 'Exports actions to a PasteBin url.',
			type: ApplicationCommandOptionType.Subcommand,
			deferType: CommandDeferType.NONE,
			options: {},
		},
	},
} satisfies CommandDefinition<ActionSubCommandEnum>;
