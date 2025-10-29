import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.ts';

export enum ModifierCommandOptionEnum {
	custom = 'custom',
	severity = 'severity',
	initiativeNote = 'initiative-note',
	name = 'name',
	type = 'type',
	description = 'description',
	rollAdjustment = 'roll-adjustment',
	targetTags = 'roll-target-tags',
	sheetValues = 'sheet-values',
	setOption = 'option',
	setValue = 'value',
	importMode = 'import-mode',
	importUrl = 'url',
}

export const modifierCommandOptions: CommandOptions = {
	[ModifierCommandOptionEnum.custom]: {
		name: 'custom',
		description: 'Whether to view custom created modifiers, default modifiers, or both.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'custom',
				value: 'custom',
			},
			{
				name: 'default',
				value: 'default',
			},
			{
				name: 'both',
				value: 'both',
			},
		],
	},
	[ModifierCommandOptionEnum.severity]: {
		name: 'severity',
		description: 'A measure of a modifier\'s effect. Use "[severity]" in the value.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ModifierCommandOptionEnum.initiativeNote]: {
		name: 'initiative-note',
		description: 'A note to display in initiative when active.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ModifierCommandOptionEnum.name]: {
		name: 'name',
		description: 'The name of the modifier.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ModifierCommandOptionEnum.type]: {
		name: 'type',
		description: 'The optional type (status, item, or circumstance) of the modifier.',
		required: false,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'status',
				value: 'status',
			},
			{
				name: 'item',
				value: 'item',
			},
			{
				name: 'circumstance',
				value: 'circumstance',
			},
			{
				name: 'untyped',
				value: 'untyped',
			},
		],
	},
	[ModifierCommandOptionEnum.description]: {
		name: 'description',
		description: 'A description for the modifier.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ModifierCommandOptionEnum.rollAdjustment]: {
		name: 'roll-adjustment',
		description: 'The amount to adjust a dice roll. Can be a number or a dice expression.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ModifierCommandOptionEnum.targetTags]: {
		name: 'roll-target-tags',
		description:
			'A set of tags for the rolls that this modifier applies to. For example "skill or attack or save"',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ModifierCommandOptionEnum.sheetValues]: {
		name: 'sheet-values',
		description: 'How to alter the sheet values. For example "maxHp+5;ac=20;will-1"',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ModifierCommandOptionEnum.setOption]: {
		name: 'option',
		description: 'The modifier option to alter.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'name',
				value: 'name',
			},
			{
				name: 'description',
				value: 'description',
			},
			{
				name: 'type',
				value: 'type',
			},
			{
				name: 'roll-adjustment',
				value: 'roll-adjustment',
			},
			{
				name: 'roll-target-tags',
				value: 'roll-target-tags',
			},
			{
				name: 'sheet-values',
				value: 'sheet-values',
			},
			{
				name: 'severity',
				value: 'severity',
			},
			{
				name: 'initiative-note',
				value: 'initiative-note',
			},
		],
	},
	[ModifierCommandOptionEnum.setValue]: {
		name: 'value',
		description: 'The value to set the option to.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ModifierCommandOptionEnum.importMode]: {
		name: 'import-mode',
		description: 'What to do when importing data.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'overwrite-all',
				value: 'overwrite-all',
			},
			{
				name: 'overwrite-on-conflict',
				value: 'overwrite-on-conflict',
			},
			{
				name: 'rename-on-conflict',
				value: 'rename-on-conflict',
			},
			{
				name: 'ignore-on-conflict',
				value: 'ignore-on-conflict',
			},
		],
	},
	[ModifierCommandOptionEnum.importUrl]: {
		name: 'url',
		description: 'The pastebin url with the modifier code to import.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<ModifierCommandOptionEnum>;
