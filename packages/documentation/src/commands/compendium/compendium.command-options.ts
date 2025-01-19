import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.js';

export enum CompendiumCommandOptionEnum {
	search = 'search',
	choice = 'choice',
}

export const compendiumCommandOptions: CommandOptions = {
	[CompendiumCommandOptionEnum.search]: {
		name: 'search',
		description: "The name of the thing you're searching for.",
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[CompendiumCommandOptionEnum.choice]: {
		name: 'compendium-choice',
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
} satisfies SpecificCommandOptions<CompendiumCommandOptionEnum>;

/**
 * Command Definition:
 *
 * Command Options:
 *
 * L.en.commandOptions
 *
 * L.en.commands
 *
 *
 */
