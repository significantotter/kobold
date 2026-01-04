import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

export enum GameplayCommandOptionEnum {
	setOption = 'set-option',
	damageAmount = 'damage-amount',
	damageType = 'damage-type',
	setValue = 'set-value',
	targetCharacter = 'target-character',
	targetChannel = 'target-channel',
	trackerMode = 'tracker-mode',
}

export const gameplayCommandOptions = {
	[GameplayCommandOptionEnum.setOption]: {
		name: GameplayCommandOptionEnum.setOption,
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
	[GameplayCommandOptionEnum.damageAmount]: {
		name: GameplayCommandOptionEnum.damageAmount,
		description: 'The amount of damage to apply. A negative number heals the target.',
		required: true,
		type: ApplicationCommandOptionType.Number,
	},
	[GameplayCommandOptionEnum.damageType]: {
		name: GameplayCommandOptionEnum.damageType,
		description: 'The type of damage to apply.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[GameplayCommandOptionEnum.setValue]: {
		name: GameplayCommandOptionEnum.setValue,
		description: "The value to update to on the target character's sheet",
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameplayCommandOptionEnum.targetCharacter]: {
		name: GameplayCommandOptionEnum.targetCharacter,
		description: 'What character to update. Defaults to your active character.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[GameplayCommandOptionEnum.targetChannel]: {
		name: GameplayCommandOptionEnum.targetChannel,
		description: 'What channel to send the tracker to. Defaults to your current channel.',
		required: false,
		type: ApplicationCommandOptionType.Channel,
	},
	[GameplayCommandOptionEnum.trackerMode]: {
		name: GameplayCommandOptionEnum.trackerMode,
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
