import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.types.js';
import {
	CharacterCommandOptionEnum,
	characterCommandOptions,
} from './character.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';
import { CommandDeferType } from '../helpers.js';

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
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[CharacterSubCommandEnum.importWanderersGuide]: {
			name: CharacterSubCommandEnum.importWanderersGuide,
			description: "Imports character data from Wanderer's Guide.",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.wgUrl]: withOrder(
					characterCommandOptions[CharacterCommandOptionEnum.wgUrl],
					1
				),
			},
		},
		[CharacterSubCommandEnum.importPathbuilder]: {
			name: CharacterSubCommandEnum.importPathbuilder,
			description: 'Imports character data from Pathbuilder.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.pathbuilderJsonId]: withOrder(
					characterCommandOptions[CharacterCommandOptionEnum.pathbuilderJsonId],
					1
				),
				[CharacterCommandOptionEnum.useStamina]: withOrder(
					characterCommandOptions[CharacterCommandOptionEnum.useStamina],
					2
				),
			},
		},
		[CharacterSubCommandEnum.importPasteBin]: {
			name: CharacterSubCommandEnum.importPasteBin,
			description: 'Imports character data from Pastebin.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.pastebinUrl]: withOrder(
					characterCommandOptions[CharacterCommandOptionEnum.pastebinUrl],
					1
				),
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
				[CharacterCommandOptionEnum.name]: withOrder(
					characterCommandOptions[CharacterCommandOptionEnum.name],
					1
				),
			},
		},
		[CharacterSubCommandEnum.setDefault]: {
			name: CharacterSubCommandEnum.setDefault,
			description: 'Sets the default character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.setDefaultScope]: withOrder(
					characterCommandOptions[CharacterCommandOptionEnum.setDefaultScope],
					1
				),
				[CharacterCommandOptionEnum.name]: withOrder(
					characterCommandOptions[CharacterCommandOptionEnum.name],
					2
				),
			},
		},
		[CharacterSubCommandEnum.sheet]: {
			name: CharacterSubCommandEnum.sheet,
			description: 'Displays the character sheet.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.sheetStyle]: withOrder(
					characterCommandOptions[CharacterCommandOptionEnum.sheetStyle],
					1
				),
			},
		},
		[CharacterSubCommandEnum.update]: {
			name: CharacterSubCommandEnum.update,
			description: 'Updates character data.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.pathbuilderJsonId]: withOrder(
					{
						...characterCommandOptions[CharacterCommandOptionEnum.pathbuilderJsonId],
						required: false,
					},
					1
				),
				[CharacterCommandOptionEnum.pastebinUrl]: withOrder(
					{
						...characterCommandOptions[CharacterCommandOptionEnum.pastebinUrl],
						required: false,
					},
					2
				),
				[CharacterCommandOptionEnum.useStamina]: withOrder(
					characterCommandOptions[CharacterCommandOptionEnum.useStamina],
					3
				),
			},
		},
	},
} satisfies CommandDefinition<CharacterSubCommandEnum>;
