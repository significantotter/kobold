import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.types.js';
import { CommandDeferType } from '../helpers.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { MinionCommandOptionEnum, minionCommandOptions } from './minion.command-options.js';
import { withOrder } from '../helpers/common.js';

export enum MinionSubCommandEnum {
	update = 'update',
	create = 'create',
	assign = 'assign',
	sheet = 'sheet',
	list = 'list',
	remove = 'remove',
	roll = 'roll',
	set = 'set',
	init = 'init',
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
					{
						...minionCommandOptions[MinionCommandOptionEnum.stats],
						required: false,
					},
					2
				),
				[MinionCommandOptionEnum.autoJoinInitiative]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.autoJoinInitiative],
					3
				),
			},
		},
		[MinionSubCommandEnum.create]: {
			name: MinionSubCommandEnum.create,
			description: 'Create a minion',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.name]: withOrder(
					{
						...minionCommandOptions[MinionCommandOptionEnum.name],
						required: false,
						description:
							'The name of the minion. If not provided, uses the creature name.',
					},
					1
				),
				[MinionCommandOptionEnum.creature]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.creature],
					2
				),
				[MinionCommandOptionEnum.template]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.template],
					3
				),
				[MinionCommandOptionEnum.stats]: withOrder(
					{
						...minionCommandOptions[MinionCommandOptionEnum.stats],
						required: false,
					},
					4
				),
				[MinionCommandOptionEnum.autoJoinInitiative]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.autoJoinInitiative],
					5
				),
			},
		},
		[MinionSubCommandEnum.assign]: {
			name: MinionSubCommandEnum.assign,
			description: 'Assign a minion to a character, or unassign it',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.minion]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.minion],
					1
				),
				[MinionCommandOptionEnum.targetCharacter]: withOrder(
					{
						...minionCommandOptions[MinionCommandOptionEnum.targetCharacter],
						required: false,
						description: 'The target character. Leave empty to unassign the minion.',
					},
					2
				),
				[MinionCommandOptionEnum.copy]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.copy],
					3
				),
			},
		},
		[MinionSubCommandEnum.sheet]: {
			name: MinionSubCommandEnum.sheet,
			description: "Display a minion's sheet",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.minion]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.minion],
					1
				),
				[MinionCommandOptionEnum.exportFormat]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.exportFormat],
					2
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
			deferType: CommandDeferType.HIDDEN,
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
				[MinionCommandOptionEnum.targetCharacter]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.targetCharacter],
					3
				),
				[MinionCommandOptionEnum.diceRollOrModifier]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.diceRollOrModifier],
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
		[MinionSubCommandEnum.init]: {
			name: MinionSubCommandEnum.init,
			description: "Add a minion to the current channel's initiative",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[MinionCommandOptionEnum.minion]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.minion],
					1
				),
				[MinionCommandOptionEnum.separateTurn]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.separateTurn],
					2
				),
				[MinionCommandOptionEnum.skillChoice]: withOrder(
					{
						...minionCommandOptions[MinionCommandOptionEnum.skillChoice],
						required: false,
					},
					3
				),
				[MinionCommandOptionEnum.rollExpression]: withOrder(
					{
						...minionCommandOptions[MinionCommandOptionEnum.rollExpression],
						required: false,
					},
					4
				),
				[MinionCommandOptionEnum.initValue]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.initValue],
					5
				),
				[MinionCommandOptionEnum.hideStats]: withOrder(
					minionCommandOptions[MinionCommandOptionEnum.hideStats],
					6
				),
			},
		},
	},
} satisfies CommandDefinition<MinionSubCommandEnum>;
