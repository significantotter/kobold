import { APIApplicationCommandStringOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class RollMacroOptions {
	public static readonly MACRO_NAME_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.rollMacroName.name(),
		description: L.en.commandOptions.rollMacroName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MACRO_VALUE_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.rollMacroValue.name(),
		description: L.en.commandOptions.rollMacroValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
