import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class ConditionOptions {
	public static readonly MODIFIER_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.modifierName.name(),
		description: L.en.commandOptions.modifierName.description(),
		autocomplete: true,
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
