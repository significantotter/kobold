import {
	APIApplicationCommandOption,
	ApplicationCommandOptionType,
	ApplicationCommandType,
} from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.types.js';
import { CommandDeferType } from '../helpers.js';
import {
	RollMacroCommandOptionEnum,
	rollMacroCommandOptions,
} from './roll-macro.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum rollMacroSubCommandEnum {
	list = 'list',
	create = 'create',
	set = 'set',
	remove = 'remove',
	assign = 'assign',
}

export const rollMacroCommandDefinition = {
	metadata: {
		name: 'roll-macro',
		description: 'Short roll that can be referenced and used by other rolls. Case insensitive.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[rollMacroSubCommandEnum.list]: {
			name: rollMacroSubCommandEnum.list,
			description: 'Lists all roll macros available to your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[RollMacroCommandOptionEnum.ownedBy]: withOrder(
					rollMacroCommandOptions[RollMacroCommandOptionEnum.ownedBy],
					1
				),
			},
		},
		[rollMacroSubCommandEnum.create]: {
			name: rollMacroSubCommandEnum.create,
			description: 'Creates a roll macro for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[RollMacroCommandOptionEnum.name]: withOrder(
					rollMacroCommandOptions[RollMacroCommandOptionEnum.name],
					1
				),
				[RollMacroCommandOptionEnum.value]: withOrder(
					rollMacroCommandOptions[RollMacroCommandOptionEnum.value],
					2
				),
				[RollMacroCommandOptionEnum.createFor]: withOrder(
					rollMacroCommandOptions[RollMacroCommandOptionEnum.createFor],
					3
				),
			},
		},
		[rollMacroSubCommandEnum.set]: {
			name: rollMacroSubCommandEnum.set,
			description: 'Sets the value of a roll macro for your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[RollMacroCommandOptionEnum.name]: withOrder(
					{
						...rollMacroCommandOptions[RollMacroCommandOptionEnum.name],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
				[RollMacroCommandOptionEnum.value]: withOrder(
					rollMacroCommandOptions[RollMacroCommandOptionEnum.value],
					2
				),
			},
		},
		[rollMacroSubCommandEnum.remove]: {
			name: rollMacroSubCommandEnum.remove,
			description: 'Removes a roll macro for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			deferType: CommandDeferType.HIDDEN,
			options: {
				[RollMacroCommandOptionEnum.name]: withOrder(
					{
						...rollMacroCommandOptions[RollMacroCommandOptionEnum.name],
						autocomplete: true,
						choices: undefined,
					} as APIApplicationCommandOption,
					1
				),
			},
		},
		[rollMacroSubCommandEnum.assign]: {
			name: rollMacroSubCommandEnum.assign,
			description:
				'Assigns a roll macro to a character or a minion, or unassigns the roll macro.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[RollMacroCommandOptionEnum.targetMacro]: withOrder(
					rollMacroCommandOptions[RollMacroCommandOptionEnum.targetMacro],
					1
				),
				[RollMacroCommandOptionEnum.assignTo]: withOrder(
					rollMacroCommandOptions[RollMacroCommandOptionEnum.assignTo],
					2
				),
				[RollMacroCommandOptionEnum.copy]: withOrder(
					rollMacroCommandOptions[RollMacroCommandOptionEnum.copy],
					3
				),
			},
		},
	},
} satisfies CommandDefinition<rollMacroSubCommandEnum>;
