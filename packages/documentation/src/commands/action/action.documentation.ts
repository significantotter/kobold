import type { CommandDocumentation } from '../helpers/commands.types.js';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import { actionCommandDefinition, ActionSubCommandEnum } from './action.command-definition.js';

export const actionCommandDocumentation: CommandDocumentation<typeof actionCommandDefinition> = {
	name: 'action',
	description: 'Commands for creating and modifying custom, rollable actions.',
	subCommands: {
		[ActionSubCommandEnum.create]: {
			name: ActionSubCommandEnum.create,
			description: '',
			usage: null,

			examples: [
				{
					title: 'Created',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I created the action {actionName:Elemental Blast (1a)} for {characterName:Lilac Sootsnout}',
					options: {
						name: 'Elemental Blast (1a)',
					},
				},
				{
					title: 'Already Exists',
					type: CommandResponseTypeEnum.error,
					message:
						'Yip! An action named {actionName:Elemental Blast (1a)} already exists for {characterName:Lilac Sootsnout}.',
					options: {
						name: 'Elemental Blast (1a)',
					},
				},
			],
		},
		[ActionSubCommandEnum.remove]: {
			name: ActionSubCommandEnum.remove,
			description: 'Removes an action.',
			usage: null,
			examples: [
				{
					title: 'Removed',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I removed the action {actionName:Elemental Blast (1a)}.',
					options: {
						action: 'Elemental Blast (1a)',
					},
				},
				{
					title: 'Not Found',
					type: CommandResponseTypeEnum.error,
					message:
						'Yip! I could not find an action with the name {actionName:Elemental Blast (1a)}.',
					options: {
						action: 'Elemental Blast (1a)',
					},
				},
			],
		},
		[ActionSubCommandEnum.set]: {
			name: ActionSubCommandEnum.set,
			description: 'Sets a field on an action. "none" clears the field.',
			usage: null,
			extendedOptionDocumentation: {
				'set-value': {
					description:
						"The field's new value must match the choice made for 'set-option'. \nA name or description can be any text value. \nThe type and the action-cost must be one of the options allowed when creating an action (see /action create). \nThe Base Level must be a whole number 0 or higher. \nAuto Heighten must be 'true' or 'false'. \nTags are a comma-separated list of words.",
				},
			},
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! {actionOption:name} was set to {newValue:Elemental Blast (2a)} for the action {actionName:Elemental Blast (1a)}.',
					options: {
						action: 'Elemental Blast (1a)',
						'set-option': 'name',
						'set-value': 'Elemental Blast (2a)',
					},
				},
				{
					title: 'Invalid Action Type',
					type: CommandResponseTypeEnum.error,
					message: 'Yip! The valid action types are "spell", "attack", and "other".',
					options: {
						action: 'Elemental Blast (1a)',
						'set-option': 'type',
						'set-value': 'impulse',
					},
				},
				{
					title: 'Invalid Action Cost',
					type: CommandResponseTypeEnum.error,
					message:
						'Yip! Valid action costs are "one", "two", "three", "free", "variable", and "reaction".',
					options: {
						action: 'Elemental Blast (1a)',
						'set-option': 'base-level',
						'set-value': '3.14159',
					},
				},
				{
					title: 'Invalid Integer',
					type: CommandResponseTypeEnum.error,
					message: 'Yip! This field must be a positive, whole number.',
					options: {
						action: 'Elemental Blast (1a)',
						'set-option': 'type',
						'set-value': 'impulse',
					},
				},
				{
					title: 'Unknown Field',
					type: CommandResponseTypeEnum.error,
					message: "Yip! That's not a field I recognize for an action!",
					options: {
						action: 'Elemental Blast (1a)',
						'set-option': 'koboldness',
						'set-value': 'superbold',
					},
				},
			],
		},
		[ActionSubCommandEnum.import]: {
			name: ActionSubCommandEnum.import,
			description: 'Imports a list of action data to a character from PasteBin.',
			usage: null,
			examples: [
				{
					title: 'Failed Parsing',
					type: CommandResponseTypeEnum.error,
					message:
						"Yip! I can't figure out how to read that! Try exporting another action to check and make sure you're formatting it right!",
					options: {
						url: 'https://pastebin.com/abc123',
						mode: 'rename-on-conflict',
					},
				},
				{
					title: 'Bad URL',
					type: CommandResponseTypeEnum.error,
					message:
						"Yip! I don't understand that Url! Copy the pastebin url for the pasted actions directly into the Url field.",
					options: {
						url: 'https://pastebin.com/abc123',
						mode: 'rename-on-conflict',
					},
				},
				{
					title: 'Imported',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I imported those actions to {characterName:Lilac Sootsnout}.',
					options: {
						url: 'https://pastebin.com/abc123',
						mode: 'rename-on-conflict',
					},
				},
			],
		},
		[ActionSubCommandEnum.export]: {
			name: ActionSubCommandEnum.export,
			description: 'Exports actions to a PasteBin url.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,

					message:
						"Yip! I've saved {characterName:Lilac Sootsnout}'s modifiers to this PasteBin link",
					options: {},
				},
			],
		},
		[ActionSubCommandEnum.list]: {
			name: ActionSubCommandEnum.list,
			description: "Lists all of your character's actions.",
			usage: null,
			examples: [
				{
					title: "Listing a character's actions",
					type: CommandResponseTypeEnum.success,
					embeds: [
						{
							title: "{characterName:Lilac Sootsnout}'s Available Actions:",
							fields: [
								{
									name: 'Elemental Blast (1a)',
									value: 'A one action kinetic blast',
									inline: true,
									inlineIndex: 1,
								},
								{
									name: 'Elemental Blast (2a)',
									value: 'A two action kinetic blast',
									inline: true,
									inlineIndex: 2,
								},
								{
									name: 'Demoralize',
									value: 'Frighten an opponent',
									inline: true,
									inlineIndex: 3,
								},
								{
									name: 'Flying Flame',
									value: 'Launch a flaming bird through enemies',
									inline: true,
									inlineIndex: 1,
								},
								{
									name: 'Lava Leap',
									value: 'Leap forward, splashing lava upon landing',
									inline: true,
									inlineIndex: 2,
								},
							],
						},
					],
					options: {},
				},
			],
		},
		[ActionSubCommandEnum.detail]: {
			name: ActionSubCommandEnum.detail,
			description: 'Describes a specific action.',
			usage: null,
			examples: [
				{
					title: 'Detailing an action',
					type: CommandResponseTypeEnum.success,
					embeds: [
						{
							title: 'emoji_oneAction Elemental Blast (1a) (spell)',
							description: 'A one action kinetic blast',
							fields: [
								{
									name: 'To Hit',
									value: 'Attack Roll\nTo hit: d20 + [class] vs ac',
								},
								{
									name: 'Damage',
									value: 'damage: (floor(([level]-1)/4)+1)d6 fire',
								},
							],
							footer: 'rollTags: impulse, fire',
						},
					],
					options: {
						action: 'Elemental Blast (1a)',
					},
				},
			],
		},
	},
};
