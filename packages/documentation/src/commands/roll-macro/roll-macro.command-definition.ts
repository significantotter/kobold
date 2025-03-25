import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import {
	RollMacroCommandOptionEnum,
	rollMacroCommandOptions,
} from './roll-macro.command-options.js';

export enum rollMacroSubCommandEnum {
	list = 'list',
	create = 'create',
	set = 'set',
	remove = 'remove',
}

export const rollMacroCommandDefinition = {
	metadata: {
		name: 'roll-macro',
		description: 'Short roll that can be referenced and used by other rolls. Case insensitive.',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[rollMacroSubCommandEnum.list]: {
			name: rollMacroSubCommandEnum.list,
			description: 'Lists all roll macros available to your active character.',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[rollMacroSubCommandEnum.create]: {
			name: rollMacroSubCommandEnum.create,
			description: 'Creates a roll macro for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[RollMacroCommandOptionEnum.name]:
					rollMacroCommandOptions[RollMacroCommandOptionEnum.name],
				[RollMacroCommandOptionEnum.value]:
					rollMacroCommandOptions[RollMacroCommandOptionEnum.value],
			},
		},
		[rollMacroSubCommandEnum.set]: {
			name: rollMacroSubCommandEnum.set,
			description: 'Sets the value of a roll macro for your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[RollMacroCommandOptionEnum.name]: {
					...rollMacroCommandOptions[RollMacroCommandOptionEnum.name],
					autocomplete: true,
					choices: undefined,
				},
				[RollMacroCommandOptionEnum.value]:
					rollMacroCommandOptions[RollMacroCommandOptionEnum.value],
			},
		},
		[rollMacroSubCommandEnum.remove]: {
			name: rollMacroSubCommandEnum.remove,
			description: 'Removes a roll macro for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[RollMacroCommandOptionEnum.name]: {
					...rollMacroCommandOptions[RollMacroCommandOptionEnum.name],
					autocomplete: true,
					choices: undefined,
				},
			},
		},
	},
} satisfies CommandDefinition<rollMacroSubCommandEnum>;
