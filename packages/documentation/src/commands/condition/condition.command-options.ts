import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

export enum ConditionCommandOptionEnum {
	name = 'name',
	targetCharacter = 'gameplay-target-character',
	severity = 'severity',
	sheetValues = 'sheet-values',
	rollAdjustment = 'roll-adjustment',
	targetTags = 'roll-target-tags',
	type = 'type',
	description = 'description',
	initiativeNote = 'initiative-note',
	setOption = 'option',
	setValue = 'value',
}

export const conditionCommandOptions = {
	[ConditionCommandOptionEnum.name]: {
		name: 'name',
		description: 'The name of the condition or modifier.',
		autocomplete: true,
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ConditionCommandOptionEnum.targetCharacter]: {
		name: ConditionCommandOptionEnum.targetCharacter,
		description: 'What character to update. Defaults to your active character.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ConditionCommandOptionEnum.severity]: {
		name: 'severity',
		description: 'A measure of a modifier\'s effect. Use "[severity]" in the value.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ConditionCommandOptionEnum.sheetValues]: {
		name: 'sheet-values',
		description: 'How to alter the sheet values. For example "maxHp+5;ac=20;will-1"',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ConditionCommandOptionEnum.rollAdjustment]: {
		name: 'roll-adjustment',
		description: 'The amount to adjust a dice roll. Can be a number or a dice expression.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ConditionCommandOptionEnum.targetTags]: {
		name: 'roll-target-tags',
		description:
			'A set of tags for the rolls that this modifier applies to. For example "skill or attack or save"',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ConditionCommandOptionEnum.type]: {
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
	[ConditionCommandOptionEnum.description]: {
		name: 'description',
		description: 'A description for the modifier.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ConditionCommandOptionEnum.initiativeNote]: {
		name: 'initiative-note',
		description: 'A note to display in initiative when active.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ConditionCommandOptionEnum.setOption]: {
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
	[ConditionCommandOptionEnum.setValue]: {
		name: 'value',
		description: 'The value to set the option to.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<ConditionCommandOptionEnum>;
