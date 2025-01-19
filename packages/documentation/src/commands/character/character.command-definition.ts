import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import {
	CharacterCommandOptionEnum,
	characterCommandOptions,
} from './character.command-options.js';

export enum CharacterSubCommandEnum {
	importWanderersGuide = 'import-wanderers-guide',
	importPathbuilder = 'import-pathbuilder',
	importPasteBin = 'import-pastebin',
	list = 'list',
	remove = 'remove',
	setActive = 'set-active',
	setDefault = 'set-default',
	sheet = 'sheet',
	update = 'update',
}

export const characterCommandDefinition = {
	metadata: {
		name: 'character',
		description: 'Commands for managing characters.',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[CharacterSubCommandEnum.importWanderersGuide]: {
			name: 'import-wanderers-guide',
			description: "Imports character data from Wanderer's Guide.",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.wgUrl]:
					characterCommandOptions[CharacterCommandOptionEnum.wgUrl],
			},
		},
		[CharacterSubCommandEnum.importPathbuilder]: {
			name: 'import-pathbuilder',
			description: 'Imports character data from Pathbuilder.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.pbJsonId]:
					characterCommandOptions[CharacterCommandOptionEnum.pbJsonId],
				[CharacterCommandOptionEnum.useStamina]:
					characterCommandOptions[CharacterCommandOptionEnum.useStamina],
			},
		},
		[CharacterSubCommandEnum.importPasteBin]: {
			name: 'import-pastebin',
			description: 'Imports character data from Pastebin.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.pastebinUrl]:
					characterCommandOptions[CharacterCommandOptionEnum.pastebinUrl],
			},
		},
		[CharacterSubCommandEnum.list]: {
			name: 'list',
			description: 'Lists all characters.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {},
		},
		[CharacterSubCommandEnum.remove]: {
			name: 'remove',
			description: 'Removes a character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {},
		},
		[CharacterSubCommandEnum.setActive]: {
			name: 'set-active',
			description: 'Sets the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.name]:
					characterCommandOptions[CharacterCommandOptionEnum.name],
			},
		},
		[CharacterSubCommandEnum.setDefault]: {
			name: 'set-default',
			description: 'Sets the default character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.setDefaultScope]:
					characterCommandOptions[CharacterCommandOptionEnum.setDefaultScope],
				[CharacterCommandOptionEnum.name]:
					characterCommandOptions[CharacterCommandOptionEnum.name],
			},
		},
		[CharacterSubCommandEnum.sheet]: {
			name: 'sheet',
			description: 'Displays the character sheet.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				// // Assuming GameOptions.GAME_SHEET_STYLE is defined elsewhere
				// [GameOptions.GAME_SHEET_STYLE]: GameOptions.GAME_SHEET_STYLE,
			},
		},
		[CharacterSubCommandEnum.update]: {
			name: 'update',
			description: 'Updates character data.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.pbJsonId]: {
					...characterCommandOptions[CharacterCommandOptionEnum.pbJsonId],
					required: false,
				},
				[CharacterCommandOptionEnum.pastebinUrl]: {
					...characterCommandOptions[CharacterCommandOptionEnum.pastebinUrl],
					required: false,
				},
				[CharacterCommandOptionEnum.useStamina]:
					characterCommandOptions[CharacterCommandOptionEnum.useStamina],
			},
		},
	},
} satisfies CommandDefinition<CharacterSubCommandEnum>;
