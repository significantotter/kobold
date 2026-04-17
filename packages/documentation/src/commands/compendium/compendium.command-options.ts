import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

export enum CompendiumCommandOptionEnum {
	search = 'search',
	choice = 'compendium-choice',
	gameSystem = 'game-system',
}

export const compendiumCommandOptions = {
	[CompendiumCommandOptionEnum.search]: {
		name: CompendiumCommandOptionEnum.search,
		description: "The name of the thing you're searching for.",
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[CompendiumCommandOptionEnum.choice]: {
		name: CompendiumCommandOptionEnum.choice,
		description: 'The compendium to search.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'archives-of-nethys',
				value: 'archives-of-nethys',
			},
			{
				name: 'pf2eTools',
				value: 'pf2eTools',
			},
		],
	},
	[CompendiumCommandOptionEnum.gameSystem]: {
		name: CompendiumCommandOptionEnum.gameSystem,
		description: 'Override the game system for this search (defaults to your setting).',
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'Pathfinder 2E',
				value: 'pf2e',
			},
			{
				name: 'Starfinder 2E',
				value: 'sf2e',
			},
		],
	},
} satisfies SpecificCommandOptions<CompendiumCommandOptionEnum>;
