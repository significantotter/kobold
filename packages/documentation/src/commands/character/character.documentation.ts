import { CommandDocumentation, CommandResponseTypeEnum } from '../helpers/commands.d.js';
import {
	characterCommandDefinition,
	CharacterSubCommandEnum,
} from './character.command-definition.js';

export const characterCommandDocumentation: CommandDocumentation<
	typeof characterCommandDefinition
> = {
	name: 'character',
	description: 'Commands for managing characters.',
	subCommands: {
		[CharacterSubCommandEnum.importWanderersGuide]: {
			name: CharacterSubCommandEnum.importWanderersGuide,
			description: "Imports character data from Wanderer's Guide.",
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Character imported successfully.',
					options: {
						['wg-url']: 'https://www.wanderersguide.app/characters/1234567890',
					},
				},
			],
		},
		[CharacterSubCommandEnum.importPathbuilder]: {
			name: CharacterSubCommandEnum.importPathbuilder,
			description: 'Imports character data from Pathbuilder.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Character imported successfully.',
					options: {
						['pb-json-id']: 1234567890,
					},
				},
			],
		},
		[CharacterSubCommandEnum.importPasteBin]: {
			name: CharacterSubCommandEnum.importPasteBin,
			description: 'Imports character data from Pastebin.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Character imported successfully.',
					options: {
						['pastebin-url']: 'https://pastebin.com/1234567890',
					},
				},
			],
		},
		[CharacterSubCommandEnum.list]: {
			name: CharacterSubCommandEnum.list,
			description: 'Lists all characters.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Characters',
					options: {},
					embeds: [
						{
							title: 'Characters',
							fields: [
								{
									name: 'Lilac Sootsnout (active)',
									value: 'Level 9 Ganzi Kobold Kineticist',
									inline: false,
									inlineIndex: 1,
								},
								{
									name: 'Ashara Keenclaw',
									value: 'Level 3 Sylph Ratfolk Magus',
									inline: false,
									inlineIndex: 2,
								},
								{
									name: 'Portia',
									value: 'Level 7 Polychromatic Anadi Bard',
									inline: false,
									inlineIndex: 3,
								},
								{
									name: 'Anatase Lightclaw',
									value: 'Level 4 Spellscale Kobold Monk',
									inline: false,
									inlineIndex: 1,
								},
								{
									name: 'Chell',
									value: 'Level 11 Swimming Animal (Water Dwelling) Awakened Animal Swashbuckler',
									inline: false,
									inlineIndex: 2,
								},
							],
						},
					],
				},
			],
		},
		[CharacterSubCommandEnum.remove]: {
			name: CharacterSubCommandEnum.remove,
			description: 'Removes a character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						"Yip! I've successfully removed {characterName:Ashara Keenclaw}! You can import them again at any time.",
					options: {},
				},
			],
		},
		[CharacterSubCommandEnum.setActive]: {
			name: CharacterSubCommandEnum.setActive,
			description: 'Sets the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Character set as active successfully.',
					options: {
						['name']: 'Lilac Sootsnout',
					},
				},
			],
		},
		[CharacterSubCommandEnum.setDefault]: {
			name: CharacterSubCommandEnum.setDefault,
			description: 'Sets the default character',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Character set as default successfully.',
					options: {
						['default-for']: 'channel',
						['name']: 'Lilac Sootsnout',
					},
				},
			],
		},
		[CharacterSubCommandEnum.sheet]: {
			name: CharacterSubCommandEnum.sheet,
			description: 'Displays the character sheet.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Here is your character sheet:',
					options: {},
				},
			],
		},
		[CharacterSubCommandEnum.update]: {
			name: CharacterSubCommandEnum.update,
			description: 'Updates a character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Character updated successfully.',
					options: {
						['pb-json-id']: 1234567890,
					},
				},
			],
		},
	},
};
