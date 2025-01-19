import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.js';

export enum CharacterCommandOptionEnum {
	setDefaultScope = 'default-for',
	wgUrl = 'wg-url',
	pbJsonId = 'pb-json-id',
	pastebinUrl = 'pastebin-url',
	useStamina = 'use-stamina',
	name = 'name',
	id = 'id',
}

export enum CharacterSetDefaultScopeOptionsEnum {
	channel = 'channel',
	server = 'server',
}

export const characterCommandOptions: CommandOptions = {
	[CharacterCommandOptionEnum.setDefaultScope]: {
		name: 'default-for',
		description: 'Set the default scope for the character.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: CharacterSetDefaultScopeOptionsEnum.channel,
				value: CharacterSetDefaultScopeOptionsEnum.channel,
			},
			{
				name: CharacterSetDefaultScopeOptionsEnum.server,
				value: CharacterSetDefaultScopeOptionsEnum.server,
			},
		],
	},
	[CharacterCommandOptionEnum.wgUrl]: {
		name: 'wg-url',
		description: "The URL for importing character data from Wanderer's Guide.",
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[CharacterCommandOptionEnum.pbJsonId]: {
		name: 'pb-json-id',
		description: 'The JSON ID for importing character data from Pathbuilder.',
		required: true,
		type: ApplicationCommandOptionType.Number,
	},
	[CharacterCommandOptionEnum.pastebinUrl]: {
		name: 'pastebin-url',
		description: 'The URL for importing character data from Pastebin.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[CharacterCommandOptionEnum.useStamina]: {
		name: 'use-stamina',
		description: 'Whether to use stamina for the character.',
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	},
	[CharacterCommandOptionEnum.name]: {
		name: 'name',
		description: 'The name of the character.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[CharacterCommandOptionEnum.id]: {
		name: 'id',
		description: 'The ID of the character.',
		required: false,
		type: ApplicationCommandOptionType.Integer,
	},
} satisfies SpecificCommandOptions<CharacterCommandOptionEnum>;

/**
 * Command Definition:
 * 
 *
 * Command Options:
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
 
 *
 * L.en.commandOptions
 *
 * L.en.commands
 *
 *
 */
