import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class CompendiumOptions {
	public static readonly COMPENDIUM_SEARCH_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.commandSearch.name(),
		description: L.en.commandOptions.commandSearch.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
}
