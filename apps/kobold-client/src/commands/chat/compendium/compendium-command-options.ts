import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class CompendiumOptions {
	public static readonly COMPENDIUM_SEARCH_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.compendiumSearch.name(),
		description: L.en.commandOptions.compendiumSearch.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COMPENDIUM_SEARCH_COMPENDIUM_CHOICE_OPTION: APIApplicationCommandBasicOption =
		{
			name: L.en.commandOptions.compendiumSearchChoice.name(),
			description: L.en.commandOptions.compendiumSearchChoice.description(),
			required: true,
			type: ApplicationCommandOptionType.String,
			choices: [
				{
					name: L.en.commandOptions.compendiumSearchChoice.choices.archivesOfNeythys.name(),
					value: L.en.commandOptions.compendiumSearchChoice.choices.archivesOfNeythys.value(),
				},
				{
					name: L.en.commandOptions.compendiumSearchChoice.choices.pf2eTools.name(),
					value: L.en.commandOptions.compendiumSearchChoice.choices.pf2eTools.value(),
				},
			],
		};
}
