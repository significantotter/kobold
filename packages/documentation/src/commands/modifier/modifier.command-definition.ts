import {
	APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.types.js';
import { ModifierCommandOptionEnum, modifierCommandOptions } from './modifier.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum ModifierSubCommandEnum {
	list = 'list',
	detail = 'detail',
	export = 'export',
	import = 'import',
	create = 'create',
	toggle = 'toggle',
	severity = 'severity',
	set = 'set',
	remove = 'remove',
}

export const modifierCommandDefinition = {
	metadata: {
		name: 'modifier',
		description: 'Toggleable values to modify specified dice rolls.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[ModifierSubCommandEnum.list]: {
			name: ModifierSubCommandEnum.list,
			description: 'Lists all modifiers available to your active character.',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[ModifierSubCommandEnum.detail]: {
			name: ModifierSubCommandEnum.detail,
			description: 'Describes a modifier available to your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ModifierCommandOptionEnum.name]: withOrder(
					{
						...modifierCommandOptions[ModifierCommandOptionEnum.name],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
		[ModifierSubCommandEnum.export]: {
			name: ModifierSubCommandEnum.export,
			description:
				'Exports a chunk of modifier data for you to later import on another character.',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[ModifierSubCommandEnum.import]: {
			name: ModifierSubCommandEnum.import,
			description: 'Imports a list of modifier data to a character from PasteBin.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ModifierCommandOptionEnum.importUrl]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.importUrl],
					1
				),
				[ModifierCommandOptionEnum.importMode]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.importMode],
					2
				),
			},
		},
		[ModifierSubCommandEnum.create]: {
			name: ModifierSubCommandEnum.create,
			description: 'Creates a modifier for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ModifierCommandOptionEnum.name]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.name],
					1
				),
				[ModifierCommandOptionEnum.sheetValues]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.sheetValues],
					2
				),
				[ModifierCommandOptionEnum.rollAdjustment]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.rollAdjustment],
					3
				),
				[ModifierCommandOptionEnum.targetTags]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.targetTags],
					4
				),
				[ModifierCommandOptionEnum.type]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.type],
					5
				),
				[ModifierCommandOptionEnum.severity]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.severity],
					6
				),
				[ModifierCommandOptionEnum.description]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.description],
					7
				),
				[ModifierCommandOptionEnum.initiativeNote]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.initiativeNote],
					8
				),
			},
		},
		[ModifierSubCommandEnum.toggle]: {
			name: ModifierSubCommandEnum.toggle,
			description:
				'Toggles whether a modifier is currently applying to your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ModifierCommandOptionEnum.name]: withOrder(
					{
						...modifierCommandOptions[ModifierCommandOptionEnum.name],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
		[ModifierSubCommandEnum.severity]: {
			name: ModifierSubCommandEnum.severity,
			description: 'Set the severity of a modifier.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ModifierCommandOptionEnum.name]: withOrder(
					{
						...modifierCommandOptions[ModifierCommandOptionEnum.name],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
				[ModifierCommandOptionEnum.severity]: withOrder(
					{
						...modifierCommandOptions[ModifierCommandOptionEnum.severity],
						required: true,
					},
					2
				),
			},
		},
		[ModifierSubCommandEnum.set]: {
			name: ModifierSubCommandEnum.set,
			description: 'Sets a field for a modifier for your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ModifierCommandOptionEnum.name]: withOrder(
					{
						...modifierCommandOptions[ModifierCommandOptionEnum.name],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
				[ModifierCommandOptionEnum.setOption]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.setOption],
					2
				),
				[ModifierCommandOptionEnum.setValue]: withOrder(
					modifierCommandOptions[ModifierCommandOptionEnum.setValue],
					3
				),
			},
		},
		[ModifierSubCommandEnum.remove]: {
			name: ModifierSubCommandEnum.remove,
			description: 'Removes a modifier for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[ModifierCommandOptionEnum.name]: withOrder(
					{
						...modifierCommandOptions[ModifierCommandOptionEnum.name],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
	},
} satisfies CommandDefinition<ModifierSubCommandEnum>;
