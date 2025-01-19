import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.js';

export enum GameCommandOptionEnum {
	gameGiveOption = 'gameGiveOption',
	gameGiveAmount = 'gameGiveAmount',
	gameSheetStyle = 'gameSheetStyle',
	gameManageOption = 'gameManageOption',
	gameManageValue = 'gameManageValue',
	gameRollType = 'gameRollType',
	gameTargetCharacter = 'gameTargetCharacter',
	gameDiceRollOrModifier = 'gameDiceRollOrModifier',
}

export const gameCommandOptions: CommandOptions = {
	[GameCommandOptionEnum.gameGiveOption]: {
		name: GameCommandOptionEnum.gameGiveOption,
		description: 'The type of resource to give of (eg. hp, hero points, etc).',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.gameGiveAmount]: {
		name: GameCommandOptionEnum.gameGiveAmount,
		description: 'The amount to give. Put "-" before to take the amount away',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.gameSheetStyle]: {
		name: GameCommandOptionEnum.gameSheetStyle,
		description: 'Whether to show only counters like hp, basic stats, or a full sheet.',
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'countersOnly',
				value: 'countersOnly',
			},
			{
				name: 'basicStats',
				value: 'basicStats',
			},
			{
				name: 'fullSheet',
				value: 'fullSheet',
			},
		],
	},
	[GameCommandOptionEnum.gameManageOption]: {
		name: GameCommandOptionEnum.gameManageOption,
		description: 'What you want to do to manage a game',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'create',
				value: 'create',
			},
			{
				name: 'join',
				value: 'join',
			},
			{
				name: 'setActive',
				value: 'setActive',
			},
			{
				name: 'leave',
				value: 'leave',
			},
			{
				name: 'kick',
				value: 'kick',
			},
			{
				name: 'delete',
				value: 'delete',
			},
		],
	},
	[GameCommandOptionEnum.gameManageValue]: {
		name: GameCommandOptionEnum.gameManageValue,
		description:
			'Enter the name of the game if creating, otherwise pick between possible choices for the action.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.gameRollType]: {
		name: GameCommandOptionEnum.gameRollType,
		description: 'The type of roll for the characters to make',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.gameTargetCharacter]: {
		name: GameCommandOptionEnum.gameTargetCharacter,
		description: 'Rolls for a single character instead of all characters.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.gameDiceRollOrModifier]: {
		name: GameCommandOptionEnum.gameDiceRollOrModifier,
		description: 'The dice roll if doing a custom roll, or a modifier to add to the roll.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<GameCommandOptionEnum>;
