import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class CharacterOptions {
	public static readonly CHARACTER_SET_DEFAULT_SCOPE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.setDefaultScope.name(),
		description: L.en.commandOptions.setDefaultScope.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.setDefaultScope.choices.channel.name(),
				value: L.en.commandOptions.setDefaultScope.choices.channel.value(),
			},
			{
				name: L.en.commandOptions.setDefaultScope.choices.server.name(),
				value: L.en.commandOptions.setDefaultScope.choices.server.value(),
			},
		],
	};
	public static readonly IMPORT_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.wgUrl.name(),
		description: L.en.commandOptions.wgUrl.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly IMPORT_PATHBUILDER_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.pbJsonId.name(),
		description: L.en.commandOptions.pbJsonId.description(),
		required: true,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly IMPORT_PASTEBIN_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.pastebinUrl.name(),
		description: L.en.commandOptions.pastebinUrl.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly IMPORT_USE_STAMINA_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.useStamina.name(),
		description: L.en.commandOptions.useStamina.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly SET_ACTIVE_NAME_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.name.name(),
		description: L.en.commandOptions.name.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly SET_ACTIVE_ID_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.id.name(),
		description: L.en.commandOptions.id.description(),
		required: false,
		type: ApplicationCommandOptionType.Integer,
	};
}
