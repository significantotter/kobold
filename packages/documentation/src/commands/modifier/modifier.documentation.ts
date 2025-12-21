import type { CommandDocumentation } from '../helpers/commands.types.js';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import {
	modifierCommandDefinition,
	ModifierSubCommandEnum,
} from './modifier.command-definition.js';
import { ModifierCommandOptionEnum } from './modifier.command-options.js';

export const modifierCommandDocumentation: CommandDocumentation<typeof modifierCommandDefinition> =
	{
		name: 'modifier',
		description: '',
		subCommands: {
			[ModifierSubCommandEnum.list]: {
				name: ModifierSubCommandEnum.list,
				description: 'Lists all modifiers available to your active character.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						options: {},
						embeds: [
							{
								title: "Lilac Sootsnout's Available Modifiers",
								fields: [
									{
										name: 'image (active)',
										value: 'Type: untyped\n\nSheet Adjustments: imageURL = https://i.imgur.com/GmUc0Yl.png',
										inline: true,
										inlineIndex: 1,
									},
									{
										name: 'Off Guard',
										value: 'Type: circumstance\n\nSheet Adjustments: ac - 2',
										inline: true,
										inlineIndex: 2,
									},
									{
										name: 'Inspire Courage',
										value: 'Type: status\n\nRoll Adjustment: +1\n\nRoll Tags to Adjust: attack and damage',
										inline: true,
										inlineIndex: 3,
									},
									{
										name: 'Untrained Improvisation',
										value: 'Type: untyped\n\nSheet Adjustments: arcana + 9; athletics + 9; crafting + 9; medicine + 9; occultism + 9; performance + 9; religion + 9; society + 9; survival + 9',
										inline: true,
										inlineIndex: 1,
									},
									{
										name: 'elemental resistance (active)',
										value: 'Type: untyped\n\nSheet Adjustments: fire resistance = 9, cold resistance = 9',
										inline: true,
										inlineIndex: 2,
									},
									{
										name: 'frightened',
										value: 'Type: circumstance\n\nSeverity: 1\n\nSheet Adjustments: checks - [severity], ac - [severity]\n\nRoll Adjustment: -[severity]\n\nRoll Tags to Adjust: attack and not damage\n\nInit tracker note: Frightened 1',
										inline: true,
										inlineIndex: 3,
									},
								],
							},
						],
					},
				],
			},
			[ModifierSubCommandEnum.detail]: {
				name: ModifierSubCommandEnum.detail,
				description: 'Describes a modifier available to your active character.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						options: { name: 'Off Guard' },
						embeds: [
							{
								title: 'Off Guard',
								description: 'Type: circumstance\n\nSheet Adjustments: ac - 2',
								fields: [],
							},
						],
					},
				],
			},
			[ModifierSubCommandEnum.severity]: {
				name: ModifierSubCommandEnum.severity,
				description: 'Set the severity of a modifier.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						options: { name: 'frightened', severity: '2' },
						embeds: [
							{
								title: 'frightened',
								description:
									'Yip! I updated the severity of the modifier "frightened" to 2.',
								fields: [],
							},
						],
					},
				],
			},
			[ModifierSubCommandEnum.toggle]: {
				name: ModifierSubCommandEnum.toggle,
				description:
					'Toggles whether a modifier is currently applying to your active character.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						options: { name: 'Off Guard' },
						message:
							'Yip! Lilac Sootsnout had their modifier "Off Guard" set to active.',
					},
				],
			},
			[ModifierSubCommandEnum.set]: {
				name: ModifierSubCommandEnum.set,
				description: 'Sets a field for a modifier for your active character.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						options: {
							name: 'Off Guard',
							[ModifierCommandOptionEnum.setOption]: 'description',
							[ModifierCommandOptionEnum.setValue]: 'A modifier',
						},
						message:
							'Yip! Lilac Sootsnout had their modifier "Off Guard"\'s description set to "A modifier".',
					},
				],
			},
			[ModifierSubCommandEnum.createModifier]: {
				name: ModifierSubCommandEnum.createModifier,
				description: 'Creates a modifier for the active character.',
				usage: null,
				examples: [
					{
						title: 'Roll Modifier',
						type: CommandResponseTypeEnum.success,
						options: {
							name: 'Burn It!',
							type: 'status',
							[ModifierCommandOptionEnum.rollAdjustment]: 'floor([spellLevel]/2)',
							[ModifierCommandOptionEnum.targetTags]: 'spell and fire',
						},
						message: 'Yip! I created the modifier "Burn It!" for Lilac Sootsnout.',
					},
					{
						title: 'Sheet Modifier',
						type: CommandResponseTypeEnum.success,
						options: {
							name: 'Thermal Nimbus',
							type: 'status',
							[ModifierCommandOptionEnum.sheetValues]:
								'fire resistance+9; cold resistance+9',
						},
						message:
							'Yip! I created the modifier "Thermal Nimbus" for Lilac Sootsnout.',
					},
				],
			},
			[ModifierSubCommandEnum.remove]: {
				name: ModifierSubCommandEnum.remove,
				description: 'Removes a modifier for the active character.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						options: { name: 'Off Guard' },
						message: 'Yip! I removed the modifier "Off Guard".',
					},
				],
			},
			[ModifierSubCommandEnum.export]: {
				name: ModifierSubCommandEnum.export,
				description:
					'Exports a chunk of modifier data for you to later import on another character.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						options: {},
						message:
							"Yip! I've saved Lilac Sootsnout's modifiers to [this PasteBin link](https://pastebin.com/)",
					},
				],
			},
			[ModifierSubCommandEnum.import]: {
				name: ModifierSubCommandEnum.import,
				description: 'Imports a list of modifier data to a character from PasteBin.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						options: { url: 'https://pastebin.com/' },
						message: 'Yip! I imported those modifiers to Lilac Sootsnout.',
					},
				],
			},
		},
	};
