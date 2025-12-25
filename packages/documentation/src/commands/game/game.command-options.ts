import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

export enum GameCommandOptionEnum {
	gameGiveOption = 'game-give-option',
	gameGiveAmount = 'game-give-amount',
	gameSheetStyle = 'game-sheet-style',
	gameCreateName = 'game-name',
	gameTargetGame = 'game-target-game',
	gameKickCharacter = 'character',
	gameRollType = 'game-roll-type',
	gameTargetCharacter = 'game-target-character',
	gameDiceRollOrModifier = 'game-dice-roll-or-modifier',
	skillChoice = 'skill',
	rollExpression = 'dice',
	rollSecret = 'secret',
	initValue = 'value',
	initCharacterTarget = 'target-character',
}

export const gameCommandOptions = {
	[GameCommandOptionEnum.gameGiveOption]: {
		name: GameCommandOptionEnum.gameGiveOption,
		description: 'The type of resource to give of (eg. hp, hero points, etc).',
		required: true,
		autocomplete: true,
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
	[GameCommandOptionEnum.gameCreateName]: {
		name: GameCommandOptionEnum.gameCreateName,
		description: 'The name for the new game.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.gameTargetGame]: {
		name: GameCommandOptionEnum.gameTargetGame,
		description: 'The game to target.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.gameKickCharacter]: {
		name: GameCommandOptionEnum.gameKickCharacter,
		description: 'The character to kick from the game.',
		required: true,
		autocomplete: true,
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
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.gameDiceRollOrModifier]: {
		name: GameCommandOptionEnum.gameDiceRollOrModifier,
		description: 'The dice roll if doing a custom roll, or a modifier to add to the roll.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.skillChoice]: {
		name: 'skill',
		description: 'The skill to roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.rollExpression]: {
		name: 'dice',
		description: 'The dice expression to roll. Similar to Roll20 dice rolls.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.rollSecret]: {
		name: 'secret',
		description: 'Whether to send the roll in a hidden, temporary message.',
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'public',
				value: 'public',
			},
			{
				name: 'secret',
				value: 'secret',
			},
			{
				name: 'secret-and-notify',
				value: 'secret-and-notify',
			},
			{
				name: 'send-to-gm',
				value: 'send-to-gm',
			},
		],
	},
	[GameCommandOptionEnum.initValue]: {
		name: 'value',
		description: 'A value to set your initiative to. Overwrites any other init options.',
		required: false,
		type: ApplicationCommandOptionType.Number,
	},
	[GameCommandOptionEnum.initCharacterTarget]: {
		name: 'target-character',
		description: 'The character being targeted.',
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<GameCommandOptionEnum>;
