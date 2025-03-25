import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import {
	CharacterCommandOptionEnum,
	characterCommandOptions,
} from './character.command-options.js';
import { GameCommandOptionEnum, gameCommandOptions } from '../game/game.command-options.js';

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
			name: CharacterSubCommandEnum.importWanderersGuide,
			description: "Imports character data from Wanderer's Guide.",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.wgUrl]:
					characterCommandOptions[CharacterCommandOptionEnum.wgUrl],
			},
		},
		[CharacterSubCommandEnum.importPathbuilder]: {
			name: CharacterSubCommandEnum.importPathbuilder,
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
			name: CharacterSubCommandEnum.importPasteBin,
			description: 'Imports character data from Pastebin.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.pastebinUrl]:
					characterCommandOptions[CharacterCommandOptionEnum.pastebinUrl],
			},
		},
		[CharacterSubCommandEnum.list]: {
			name: CharacterSubCommandEnum.list,
			description: 'Lists all characters.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {},
		},
		[CharacterSubCommandEnum.remove]: {
			name: CharacterSubCommandEnum.remove,
			description: 'Removes a character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {},
		},
		[CharacterSubCommandEnum.setActive]: {
			name: CharacterSubCommandEnum.setActive,
			description: 'Sets the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.name]:
					characterCommandOptions[CharacterCommandOptionEnum.name],
			},
		},
		[CharacterSubCommandEnum.setDefault]: {
			name: CharacterSubCommandEnum.setDefault,
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
			name: CharacterSubCommandEnum.sheet,
			description: 'Displays the character sheet.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameCommandOptionEnum.gameSheetStyle]:
					gameCommandOptions[GameCommandOptionEnum.gameSheetStyle],
			},
		},
		[CharacterSubCommandEnum.update]: {
			name: CharacterSubCommandEnum.update,
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
