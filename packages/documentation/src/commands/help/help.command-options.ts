import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.js';

export enum HelpCommandOptionEnum {
	customActionExample = 'example-choice',
}

export const helpCommandOptions: CommandOptions = {
	[HelpCommandOptionEnum.customActionExample]: {
		name: 'example-choice',
		description: 'Which custom action should we walk through?',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'Produce Flame (simple attack roll cantrip)',
				value: 'produceFlame',
			},
			{
				name: 'Fireball (simple save with basic damage)',
				value: 'fireball',
			},
			{
				name: 'Phantom Pain (save with complex results)',
				value: 'phantomPain',
			},
			{
				name: 'Gunslinger: Paired Shots (multiple strikes with deadly crits)',
				value: 'gunslingerPairedShots',
			},
			{
				name: 'Battle Medicine (Heal with a Skill Challenge roll)',
				value: 'battleMedicine',
			},
		],
	},
} satisfies SpecificCommandOptions<HelpCommandOptionEnum>;
