import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { SpecificCommandOptions } from '../helpers/commands.types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';

export enum CharacterCommandOptionEnum {
	setDefaultScope = 'default-for',
	wgUrl = 'wg-url',
	pathbuilderJsonId = 'pb-json-id',
	pastebinUrl = 'pastebin-url',
	useStamina = 'use-stamina',
	name = 'name',
	id = 'id',
	sheetStyle = 'sheet-style',
}

export enum CharacterSetDefaultScopeOptionsEnum {
	channel = 'channel',
	server = 'server',
}

export const characterCommandOptions = {
	[CharacterCommandOptionEnum.setDefaultScope]: {
		name: 'default-for',
		description: 'Set the default scope for the character.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(CharacterSetDefaultScopeOptionsEnum).map(scope => ({
			name: scope,
			value: scope,
		})),
	},
	[CharacterCommandOptionEnum.wgUrl]: {
		name: 'wg-url',
		description: "The URL for importing character data from Wanderer's Guide.",
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[CharacterCommandOptionEnum.pathbuilderJsonId]: {
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
	[CharacterCommandOptionEnum.sheetStyle]: {
		name: CharacterCommandOptionEnum.sheetStyle,
		description: 'Whether to show only counters like hp, basic stats, or a full sheet.',
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(sharedStrings.options.sheetStyles).map(style => ({
			name: style,
			value: style,
		})),
	},
} satisfies SpecificCommandOptions<CharacterCommandOptionEnum>;
