import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.js';

export enum GameplayCommandOptionEnum {
	gameplaySetOption = 'gameplaySetOption',
	gameplayDamageAmount = 'gameplayDamageAmount',
	gameplayDamageType = 'gameplayDamageType',
	gameplaySetValue = 'gameplaySetValue',
	gameplayTargetCharacter = 'gameplayTargetCharacter',
	gameplayTargetChannel = 'gameplayTargetChannel',
	gameplayTrackerMode = 'gameplayTrackerMode',
}

export const gameplayCommandOptions: CommandOptions = {
	[GameplayCommandOptionEnum.gameplaySetOption]: {
		name: GameplayCommandOptionEnum.gameplaySetOption,
		description: "What option to update on the target character's sheet",
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'hp',
				value: 'hp',
			},
			{
				name: 'tempHp',
				value: 'tempHp',
			},
			{
				name: 'stamina',
				value: 'stamina',
			},
			{
				name: 'resolve',
				value: 'resolve',
			},
			{
				name: 'hero points',
				value: 'hero-points',
			},
			{
				name: 'focus points',
				value: 'focus-points',
			},
		],
	},
	[GameplayCommandOptionEnum.gameplayDamageAmount]: {
		name: GameplayCommandOptionEnum.gameplayDamageAmount,
		description: 'The amount of damage to apply. A negative number heals the target.',
		required: true,
		type: ApplicationCommandOptionType.Number,
	},
	[GameplayCommandOptionEnum.gameplayDamageType]: {
		name: GameplayCommandOptionEnum.gameplayDamageType,
		description: 'The type of damage to apply.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[GameplayCommandOptionEnum.gameplaySetValue]: {
		name: GameplayCommandOptionEnum.gameplaySetValue,
		description: "The value to update to on the target character's sheet",
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameplayCommandOptionEnum.gameplayTargetCharacter]: {
		name: GameplayCommandOptionEnum.gameplayTargetCharacter,
		description: 'What character to update. Defaults to your active character.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameplayCommandOptionEnum.gameplayTargetChannel]: {
		name: GameplayCommandOptionEnum.gameplayTargetChannel,
		description: 'What channel to send the tracker to. Defaults to your current channel.',
		required: false,
		type: ApplicationCommandOptionType.Channel,
	},
	[GameplayCommandOptionEnum.gameplayTrackerMode]: {
		name: GameplayCommandOptionEnum.gameplayTrackerMode,
		description: 'How much information to track for the character.',
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'counters-only',
				value: 'counters_only',
			},
			{
				name: 'basic-stats',
				value: 'basic_stats',
			},
			{
				name: 'full-sheet',
				value: 'full_sheet',
			},
		],
	},
} satisfies SpecificCommandOptions<GameplayCommandOptionEnum>;
