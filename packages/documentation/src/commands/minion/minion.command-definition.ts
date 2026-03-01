import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.types.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { MinionCommandOptionEnum, minionCommandOptions } from './minion.command-options.js';
import { withOrder } from '../helpers/common.js';

export enum MinionSubCommandEnum {
	update = 'update',
	create = 'create',
	assign = 'assign',
	display = 'display',
	list = 'list',
	remove = 'remove',
	roll = 'roll',
	set = 'set',
}

export const minionCommandDefinition = {
	metadata: {
		name: 'minion',
		description: 'Minions that join combat under control of a character.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[MinionSubCommandEnum.update]: {
			name: MinionSubCommandEnum.update,
			description: 'Update a minion',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.minion]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.minion],
					1
				),
				[MinionCommandOptionEnum.stats]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.stats],
					2
				),
			},
		},
		[MinionSubCommandEnum.create]: {
			name: MinionSubCommandEnum.create,
			description: 'Create a minion',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.name]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.name],
					1
				),
				[MinionCommandOptionEnum.stats]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.stats],
					2
				),
			},
		},
		[MinionSubCommandEnum.assign]: {
			name: MinionSubCommandEnum.assign,
			description: 'Assign a minion to a character',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.minion]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.minion],
					1
				),
				[MinionCommandOptionEnum.targetCharacter]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.targetCharacter],
					2
				),
			},
		},
		[MinionSubCommandEnum.display]: {
			name: MinionSubCommandEnum.display,
			description: 'Display a minion',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.minion]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.minion],
					1
				),
			},
		},
		[MinionSubCommandEnum.list]: {
			name: MinionSubCommandEnum.list,
			description: 'List minions',
			type: ApplicationCommandOptionType.Subcommand,
			options: {},
		},
		[MinionSubCommandEnum.remove]: {
			name: MinionSubCommandEnum.remove,
			description: 'Remove a minion',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.minion]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.minion],
					1
				),
			},
		},
		[MinionSubCommandEnum.roll]: {
			name: MinionSubCommandEnum.roll,
			description: 'Roll a minion action',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.minion]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.minion],
					1
				),
				[MinionCommandOptionEnum.rollType]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.rollType],
					2
				),
				[MinionCommandOptionEnum.diceRollOrModifier]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.diceRollOrModifier],
					3
				),
				[MinionCommandOptionEnum.targetCharacter]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.targetCharacter],
					4
				),
				[MinionCommandOptionEnum.rollSecret]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.rollSecret],
					5
				),
			},
		},
		[MinionSubCommandEnum.set]: {
			name: MinionSubCommandEnum.set,
			description: 'Set a value for a minion',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.minion]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.minion],
					1
				),
				[MinionCommandOptionEnum.attribute]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.attribute],
					2
				),
				[MinionCommandOptionEnum.value]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.value],
					3
				),
			},
		},
	},
} satisfies CommandDefinition<MinionSubCommandEnum>;
