import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class ConditionOptions {
	public static readonly CONDITION_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.conditionName.name(),
		description: L.en.commandOptions.conditionName.description(),
		autocomplete: true,
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
