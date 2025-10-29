import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.d.ts';
import { RollCommandOptionEnum, rollCommandOptions } from '../roll/roll.command-options.js';
import { InitCommandOptionEnum, initCommandOptions } from './init.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum InitSubCommandEnum {
	start = 'start',
	show = 'show',
	next = 'next',
	prev = 'prev',
	jumpTo = 'jump-to',
	join = 'join',
	add = 'add',
	note = 'note',
	set = 'set',
	remove = 'remove',
	statBlock = 'stat-block',
	roll = 'roll',
	end = 'end',
}

export const initCommandDefinition = {
	metadata: {
		name: 'init',
		description: 'Initiative Tracking',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[InitSubCommandEnum.start]: {
			name: InitSubCommandEnum.start,
			description: 'Start initiative in the current channel.',
			type: ApplicationCommandOptionType.Subcommand,
		},
		[InitSubCommandEnum.show]: {
			name: InitSubCommandEnum.show,
			description: `Displays the current initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
		},
		[InitSubCommandEnum.next]: {
			name: InitSubCommandEnum.next,
			description: `Moves to the next participant in the initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
		},
		[InitSubCommandEnum.prev]: {
			name: InitSubCommandEnum.prev,
			description: `Moves to the previous participant in the initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
		},
		[InitSubCommandEnum.jumpTo]: {
			name: InitSubCommandEnum.jumpTo,
			description: `Jumps to a specific participant in the initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: withOrder(
					initCommandOptions[InitCommandOptionEnum.initCharacter],
					1
				),
			},
		},
		[InitSubCommandEnum.join]: {
			name: InitSubCommandEnum.join,
			description:
				'Joins initiative with your active character. Defaults to rolling perception.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[RollCommandOptionEnum.skillChoice]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.skillChoice],
						description:
							'The name of the skill ("perception") to use to join initiative.',
					},
					1
				),
				[RollCommandOptionEnum.rollExpression]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollExpression],
						description: 'The dice expression ("1d20+5") to use to join initiative.',
					},
					2
				),
				[InitCommandOptionEnum.initValue]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initValue],
						required: false,
					},
					3
				),
				[InitCommandOptionEnum.initHideStats]: withOrder(
					initCommandOptions[InitCommandOptionEnum.initHideStats],
					4
				),
			},
		},
		[InitSubCommandEnum.add]: {
			name: InitSubCommandEnum.add,
			description: `Adds an NPC or minion to initiative`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCreature]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initCreature],
					},
					1
				),
				[InitCommandOptionEnum.initActor]: withOrder(
					{ ...initCommandOptions[InitCommandOptionEnum.initActor], required: false },
					2
				),
				[RollCommandOptionEnum.rollExpression]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollExpression],
						required: false,
						description: 'The dice expression ("1d20+5") to use to join initiative.',
					},
					3
				),
				[InitCommandOptionEnum.initValue]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initValue],
						required: false,
					},
					4
				),
				[InitCommandOptionEnum.initHideStats]: withOrder(
					initCommandOptions[InitCommandOptionEnum.initHideStats],
					5
				),
				[InitCommandOptionEnum.initCustomStats]: withOrder(
					initCommandOptions[InitCommandOptionEnum.initCustomStats],
					6
				),
				[InitCommandOptionEnum.template]: withOrder(
					initCommandOptions[InitCommandOptionEnum.template],
					7
				),
			},
		},
		[InitSubCommandEnum.note]: {
			name: InitSubCommandEnum.note,
			description: `Sets a note for a character in the initiative.`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initCharacter],
						required: false,
					},
					1
				),
				[InitCommandOptionEnum.initNote]: withOrder(
					initCommandOptions[InitCommandOptionEnum.initNote],
					2
				),
			},
		},
		[InitSubCommandEnum.set]: {
			name: InitSubCommandEnum.set,
			description: `Sets certain properties of your character for initiative`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initCharacter],
						required: true,
					},
					1
				),
				[InitCommandOptionEnum.initSetOption]: withOrder(
					initCommandOptions[InitCommandOptionEnum.initSetOption],
					2
				),
				[InitCommandOptionEnum.initSetValue]: withOrder(
					initCommandOptions[InitCommandOptionEnum.initSetValue],
					3
				),
			},
		},
		[InitSubCommandEnum.remove]: {
			name: InitSubCommandEnum.remove,
			description: `Removes a character from the initiative`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: withOrder(
					initCommandOptions[InitCommandOptionEnum.initCharacter],
					1
				),
			},
		},
		[InitSubCommandEnum.statBlock]: {
			name: InitSubCommandEnum.statBlock,
			description: `Displays the statBlock for a creature in the initiative order`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initCharacter],
						required: true,
					},
					1
				),
				[RollCommandOptionEnum.rollSecret]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollSecret],
					2
				),
			},
		},
		[InitSubCommandEnum.roll]: {
			name: InitSubCommandEnum.roll,
			description: `Rolls dice for an initiative member that you control`,
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[InitCommandOptionEnum.initCharacter]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initCharacter],
						required: true,
					},
					1
				),
				[InitCommandOptionEnum.initRollChoice]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initRollChoice],
						required: true,
					},
					2
				),
				[InitCommandOptionEnum.initCharacterTarget]: withOrder(
					{
						...initCommandOptions[InitCommandOptionEnum.initCharacterTarget],
						required: true,
					},
					3
				),
				[RollCommandOptionEnum.rollModifier]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollModifier],
					4
				),
				[RollCommandOptionEnum.damageRollModifier]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.damageRollModifier],
					5
				),
				[RollCommandOptionEnum.rollSecret]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollSecret],
					6
				),
				[RollCommandOptionEnum.rollTargetAc]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollTargetAc],
					7
				),
				[RollCommandOptionEnum.rollNote]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollNote],
					8
				),
			},
		},
		[InitSubCommandEnum.end]: {
			name: InitSubCommandEnum.end,
			description: `Ends the current initiative`,
			type: ApplicationCommandOptionType.Subcommand,
		},
	},
} satisfies CommandDefinition<InitSubCommandEnum>;
