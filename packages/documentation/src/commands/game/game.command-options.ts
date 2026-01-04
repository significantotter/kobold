import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

export enum GameCommandOptionEnum {
	giveOption = 'give-option',
	giveAmount = 'give-amount',
	sheetStyle = 'sheet-style',
	createName = 'name',
	targetGame = 'target-game',
	targetCharacter = 'character',
	rollType = 'roll-type',
	diceRollOrModifier = 'dice-roll-or-modifier',
	skillChoice = 'skill',
	rollExpression = 'dice',
	rollSecret = 'secret',
	initValue = 'value',
	initCharacterTarget = 'target-character',
}

export const gameCommandOptions = {
	[GameCommandOptionEnum.giveOption]: {
		name: GameCommandOptionEnum.giveOption,
		description: 'The type of resource to give of (eg. hp, hero points, etc).',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.giveAmount]: {
		name: GameCommandOptionEnum.giveAmount,
		description: 'The amount to give. Put "-" before to take the amount away',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.sheetStyle]: {
		name: GameCommandOptionEnum.sheetStyle,
		description: 'Whether to show only counters like hp, basic stats, or a full sheet.',
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'counters_only',
				value: 'counters_only',
			},
			{
				name: 'basic_stats',
				value: 'basic_stats',
			},
			{
				name: 'full_sheet',
				value: 'full_sheet',
			},
		],
	},
	[GameCommandOptionEnum.createName]: {
		name: GameCommandOptionEnum.createName,
		description: 'The name for the new game.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.targetGame]: {
		name: GameCommandOptionEnum.targetGame,
		description: 'The game to target.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.rollType]: {
		name: GameCommandOptionEnum.rollType,
		description: 'The type of roll for the characters to make',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.targetCharacter]: {
		name: GameCommandOptionEnum.targetCharacter,
		description: 'Rolls for a single character instead of all characters.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameCommandOptionEnum.diceRollOrModifier]: {
		name: GameCommandOptionEnum.diceRollOrModifier,
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
