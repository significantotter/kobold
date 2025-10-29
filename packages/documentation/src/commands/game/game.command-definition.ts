import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.d.ts';
import { GameCommandOptionEnum, gameCommandOptions } from './game.command-options.js';
import { RollCommandOptionEnum, rollCommandOptions } from '../roll/roll.command-options.js';
import { InitCommandOptionEnum, initCommandOptions } from '../init/init.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum GameSubCommandEnum {
	manage = 'manage',
	init = 'init',
	partyStatus = 'party-status',
	give = 'give',
	roll = 'roll',
	list = 'list',
}

export const gameCommandDefinition = {
	metadata: {
		name: 'game',
		description: 'Commands for interacting with players as the GM of a game.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[GameSubCommandEnum.manage]: {
			name: GameSubCommandEnum.manage,
			description:
				"Manage a a GM'd group of characters. Choose to create, delete, set-active, join, kick, or leave",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameManageOption]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameManageOption],
					1
				),
				[GameCommandOptionEnum.gameManageValue]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameManageValue],
					2
				),
			},
		},
		[GameSubCommandEnum.init]: {
			name: GameSubCommandEnum.init,
			description:
				'Starts initiative and adds joins with all characters in the game. GM only.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetCharacter]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameTargetCharacter],
					1
				),
				[RollCommandOptionEnum.skillChoice]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.skillChoice],
						description: 'The skill to use for initiative instead of perception.',
						required: false,
					},
					2
				),
				[RollCommandOptionEnum.rollExpression]: withOrder(
					{
						...rollCommandOptions[RollCommandOptionEnum.rollExpression],
						required: false,
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
			},
		},
		[GameSubCommandEnum.partyStatus]: {
			name: GameSubCommandEnum.partyStatus,
			description: 'Displays the status of all party members.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetCharacter]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameTargetCharacter],
					1
				),
				[GameCommandOptionEnum.gameSheetStyle]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameSheetStyle],
					2
				),
			},
		},
		[GameSubCommandEnum.give]: {
			name: GameSubCommandEnum.give,
			description: 'Gives certain resources to players in the game.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetCharacter]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameTargetCharacter],
					1
				),
				[GameCommandOptionEnum.gameGiveOption]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameGiveOption],
					2
				),
				[GameCommandOptionEnum.gameGiveAmount]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameGiveAmount],
					3
				),
			},
		},
		[GameSubCommandEnum.roll]: {
			name: GameSubCommandEnum.roll,
			description: 'Rolls dice for all characters in a game (or optionally one). GM only.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetCharacter]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameTargetCharacter],
					1
				),
				[GameCommandOptionEnum.gameRollType]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameRollType],
					2
				),
				[GameCommandOptionEnum.gameDiceRollOrModifier]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameDiceRollOrModifier],
					3
				),
				[InitCommandOptionEnum.initCharacterTarget]: withOrder(
					initCommandOptions[InitCommandOptionEnum.initCharacterTarget],
					4
				),
				[RollCommandOptionEnum.rollSecret]: withOrder(
					rollCommandOptions[RollCommandOptionEnum.rollSecret],
					5
				),
			},
		},
		[GameSubCommandEnum.list]: {
			name: GameSubCommandEnum.list,
			description: 'Lists all of the games you have in this server.',
			type: ApplicationCommandOptionType.Subcommand,
		},
	},
} satisfies CommandDefinition<GameSubCommandEnum>;
