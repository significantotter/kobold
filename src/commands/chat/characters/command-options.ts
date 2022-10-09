import {
	APIApplicationCommandBasicOption,
	ApplicationCommandOptionType,
} from 'discord-api-types/v10';
import { Language } from '../../../models/enum-helpers/index.js';

export class CharacterOptions {
	public static readonly IMPORT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commands.character.commandOptions.wgUrl.name(),
		description: Language.LL.commands.character.commandOptions.wgUrl.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commands.character.commandOptions.name.name(),
		description: Language.LL.commands.character.commandOptions.name.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_ID_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commands.character.commandOptions.id.name(),
		description: Language.LL.commands.character.commandOptions.id.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
}
