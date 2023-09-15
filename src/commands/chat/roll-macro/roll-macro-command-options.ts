import { APIApplicationCommandStringOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class RollMacroOptions {
	public static readonly MACRO_NAME_OPTION: APIApplicationCommandStringOption = {
		name: Language.LL.commandOptions.rollMacroName.name(),
		description: Language.LL.commandOptions.rollMacroName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly MACRO_VALUE_OPTION: APIApplicationCommandStringOption = {
		name: Language.LL.commandOptions.rollMacroValue.name(),
		description: Language.LL.commandOptions.rollMacroValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
