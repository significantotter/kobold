import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class CharacterOptions {
	public static readonly CHARACTER_SET_DEFAULT_SCOPE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.setDefaultScope.name(),
		description: Language.LL.commandOptions.setDefaultScope.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.setDefaultScope.choices.channel.name(),
				value: Language.LL.commandOptions.setDefaultScope.choices.channel.value(),
			},
			{
				name: Language.LL.commandOptions.setDefaultScope.choices.server.name(),
				value: Language.LL.commandOptions.setDefaultScope.choices.server.value(),
			},
		],
	};
	public static readonly IMPORT_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.wgUrl.name(),
		description: Language.LL.commandOptions.wgUrl.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly IMPORT_PATHBUILDER_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.pbJsonId.name(),
		description: Language.LL.commandOptions.pbJsonId.description(),
		required: true,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly IMPORT_USE_STAMINA_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.useStamina.name(),
		description: Language.LL.commandOptions.useStamina.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly SET_ACTIVE_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.name.name(),
		description: Language.LL.commandOptions.name.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_ID_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.id.name(),
		description: Language.LL.commandOptions.id.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
}
