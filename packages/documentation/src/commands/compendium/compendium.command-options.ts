import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.ts';

export enum CompendiumCommandOptionEnum {
	search = 'search',
	choice = 'compendium-choice',
}

export const compendiumCommandOptions: CommandOptions = {
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
} satisfies SpecificCommandOptions<CompendiumCommandOptionEnum>;
