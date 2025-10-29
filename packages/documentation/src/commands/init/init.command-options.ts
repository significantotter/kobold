import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.ts';

export enum InitCommandOptionEnum {
	initValue = 'value',
	initNote = 'note',
	template = 'template',
	initActor = 'name',
	initCharacter = 'character',
	initCharacterTarget = 'target-character',
	initCreature = 'creature',
	initHideStats = 'hide-stats',
	initCustomStats = 'custom-stats',
	initTargetActor = 'target-initiative-member',
	initRollChoice = 'roll',
	initSetOption = 'option',
	initSetValue = 'set-value',
}

export const initCommandOptions: CommandOptions = {
	[InitCommandOptionEnum.initValue]: {
		name: 'value',
		description: 'A value to set your initiative to. Overwrites any other init options.',
		required: false,
		type: ApplicationCommandOptionType.Number,
	},
	[InitCommandOptionEnum.initNote]: {
		name: 'note',
		description: 'A note displayed in the initiative tracker. "-" or "none" to remove.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.template]: {
		name: 'template',
		description: 'Optionally apply a template to the added creature.',
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'normal',
				value: 'normal',
			},
			{
				name: 'elite',
				value: 'elite',
			},
			{
				name: 'weak',
				value: 'weak',
			},
		],
	},
	[InitCommandOptionEnum.initActor]: {
		name: 'name',
		description: 'What to display the NPC/minion as in the initiative order.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initCharacter]: {
		name: 'character',
		description: 'A character or npc present in the initiative.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initCharacterTarget]: {
		name: 'target-character',
		description: 'The character being targeted.',
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initCreature]: {
		name: 'creature',
		description: 'A creature to add to the initiative.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initHideStats]: {
		name: 'hide-stats',
		description: 'Whether to hide the stats of the character/creature in the initiative.',
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	},
	[InitCommandOptionEnum.initCustomStats]: {
		name: 'custom-stats',
		description: 'Overrides for the custom stats. In the format "hp=35;ac=20;will=7"',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initTargetActor]: {
		name: 'target-initiative-member',
		description: 'Which member of the initiative to target.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initRollChoice]: {
		name: 'roll',
		description:
			'What to have that initiative member roll. Choose the initiative member first!',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[InitCommandOptionEnum.initSetOption]: {
		name: 'option',
		description: 'The character option to alter (only within this initiative).',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'initiative',
				value: 'initiative',
			},
			{
				name: 'name',
				value: 'name',
			},
			{
				name: 'player-is-gm',
				value: 'player-is-gm',
			},
			{
				name: 'hide-stats',
				value: 'hide-stats',
			},
		],
	},
	[InitCommandOptionEnum.initSetValue]: {
		name: 'value',
		description: 'The value to set the option to.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<InitCommandOptionEnum>;
