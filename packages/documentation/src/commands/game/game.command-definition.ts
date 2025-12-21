import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.types.js';
import { GameCommandOptionEnum, gameCommandOptions } from './game.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum GameSubCommandEnum {
	create = 'create',
	join = 'join',
	setActive = 'set-active',
	leave = 'leave',
	kick = 'kick',
	delete = 'delete',
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
		[GameSubCommandEnum.create]: {
			name: GameSubCommandEnum.create,
			description: 'Create a new game in this server.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameCreateName]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameCreateName],
					1
				),
			},
		},
		[GameSubCommandEnum.join]: {
			name: GameSubCommandEnum.join,
			description: 'Join your active character to a game.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetGame]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameTargetGame],
					1
				),
			},
		},
		[GameSubCommandEnum.setActive]: {
			name: GameSubCommandEnum.setActive,
			description: 'Set a game as your active game in this server.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetGame]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameTargetGame],
					1
				),
			},
		},
		[GameSubCommandEnum.leave]: {
			name: GameSubCommandEnum.leave,
			description: 'Remove your active character from a game.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetGame]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameTargetGame],
					1
				),
			},
		},
		[GameSubCommandEnum.kick]: {
			name: GameSubCommandEnum.kick,
			description: 'Kick a character from your game. GM only.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetGame]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameTargetGame],
					1
				),
				[GameCommandOptionEnum.gameKickCharacter]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameKickCharacter],
					2
				),
			},
		},
		[GameSubCommandEnum.delete]: {
			name: GameSubCommandEnum.delete,
			description: 'Delete a game you created. GM only.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameTargetGame]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.gameTargetGame],
					1
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
				[GameCommandOptionEnum.skillChoice]: withOrder(
					{
						...gameCommandOptions[GameCommandOptionEnum.skillChoice],
						description: 'The skill to use for initiative instead of perception.',
						required: false,
					},
					2
				),
				[GameCommandOptionEnum.rollExpression]: withOrder(
					{
						...gameCommandOptions[GameCommandOptionEnum.rollExpression],
						required: false,
					},
					3
				),
				[GameCommandOptionEnum.initValue]: withOrder(
					{
						...gameCommandOptions[GameCommandOptionEnum.initValue],
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
				[GameCommandOptionEnum.initCharacterTarget]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.initCharacterTarget],
					4
				),
				[GameCommandOptionEnum.rollSecret]: withOrder(
					gameCommandOptions[GameCommandOptionEnum.rollSecret],
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
