import { ApplicationCommandOptionType } from '../helpers/discord-enums.js';
import type { CommandOptions } from '../helpers/commands.d.js';

export enum ActionCommandOptionEnum {
	name = 'name',
	description = 'description',
	type = 'action-type',
	actionCost = 'actions',
	baseLevel = 'base-level',
	autoHeighten = 'auto-heighten',
	targetAction = 'action',
	setOption = 'set-option',
	setValue = 'set-value',
	tags = 'tags',
	url = 'url',
	importMode = 'mode',
}

export enum ActionTypeChoicesEnum {
	attack = 'attack',
	spell = 'spell',
	other = 'other',
}

export enum ActionCostChoicesEnum {
	reaction = 'reaction',
	free = 'free-action',
	one = 'one-action',
	two = 'two-actions',
	three = 'three-actions',
	variable = 'variable-actions',
}

export enum ActionSetOptionChoicesEnum {
	name = 'name',
	description = 'description',
	type = 'type',
	actionCost = 'action-cost',
	baseLevel = 'base-level',
	tags = 'tags',
	autoHeighten = 'auto-heighten',
}

export enum ActionImportModeChoicesEnum {
	overwriteAll = 'overwrite-all',
	overwriteOnConflict = 'overwrite-on-conflict',
	renameOnConflict = 'rename-on-conflict',
	ignoreOnConflict = 'ignore-on-conflict',
}

export const actionCommandOptions = {
	[ActionCommandOptionEnum.name]: {
		name: ActionCommandOptionEnum.name,
		description: 'The name of the action.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionCommandOptionEnum.description]: {
		name: ActionCommandOptionEnum.description,
		description: 'The description of the action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionCommandOptionEnum.type]: {
		name: ActionCommandOptionEnum.type,
		description: 'The type of action.',
		required: true,
		choices: [
			{
				name: ActionTypeChoicesEnum.attack,
				value: ActionTypeChoicesEnum.attack,
			},
			{
				name: ActionTypeChoicesEnum.spell,
				value: ActionTypeChoicesEnum.spell,
			},
			{
				name: ActionTypeChoicesEnum.other,
				value: ActionTypeChoicesEnum.other,
			},
		],
		type: ApplicationCommandOptionType.String,
	},
	[ActionCommandOptionEnum.actionCost]: {
		name: ActionCommandOptionEnum.actionCost,
		description: 'The number of actions used.',
		required: true,
		choices: [
			{
				name: ActionCostChoicesEnum.reaction,
				value: ActionCostChoicesEnum.reaction,
			},
			{
				name: ActionCostChoicesEnum.free,
				value: ActionCostChoicesEnum.free,
			},
			{
				name: ActionCostChoicesEnum.one,
				value: ActionCostChoicesEnum.one,
			},
			{
				name: ActionCostChoicesEnum.two,
				value: ActionCostChoicesEnum.two,
			},
			{
				name: ActionCostChoicesEnum.three,
				value: ActionCostChoicesEnum.three,
			},
			{
				name: ActionCostChoicesEnum.variable,
				value: ActionCostChoicesEnum.variable,
			},
		],
		type: ApplicationCommandOptionType.String,
	},
	[ActionCommandOptionEnum.baseLevel]: {
		name: ActionCommandOptionEnum.baseLevel,
		description:
			'The default (and minimum) level of the action. Access this value in a roll with [actionLevel].',
		required: false,
		type: ApplicationCommandOptionType.Integer,
	},
	[ActionCommandOptionEnum.autoHeighten]: {
		name: ActionCommandOptionEnum.autoHeighten,
		description: "Whether to default [actionLevel] to half the character's level rounded up.",
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	},
	[ActionCommandOptionEnum.targetAction]: {
		name: ActionCommandOptionEnum.targetAction,
		description: 'The target action.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionCommandOptionEnum.setOption]: {
		name: ActionCommandOptionEnum.setOption,
		description: 'The field to set to a new value.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: ActionSetOptionChoicesEnum.name,
				value: ActionSetOptionChoicesEnum.name,
			},
			{
				name: ActionSetOptionChoicesEnum.description,
				value: ActionSetOptionChoicesEnum.description,
			},
			{
				name: ActionSetOptionChoicesEnum.type,
				value: ActionSetOptionChoicesEnum.type,
			},
			{
				name: ActionSetOptionChoicesEnum.actionCost,
				value: ActionSetOptionChoicesEnum.actionCost,
			},
			{
				name: ActionSetOptionChoicesEnum.baseLevel,
				value: ActionSetOptionChoicesEnum.baseLevel,
			},
			{
				name: ActionSetOptionChoicesEnum.tags,
				value: ActionSetOptionChoicesEnum.tags,
			},
			{
				name: ActionSetOptionChoicesEnum.autoHeighten,
				value: ActionSetOptionChoicesEnum.autoHeighten,
			},
		],
	},
	[ActionCommandOptionEnum.setValue]: {
		name: ActionCommandOptionEnum.setValue,
		description: 'The value to change the option to.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionCommandOptionEnum.tags]: {
		name: ActionCommandOptionEnum.tags,
		description: 'the tags used to describe this part of the action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionCommandOptionEnum.url]: {
		name: ActionCommandOptionEnum.url,
		description: 'The url to import from',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionCommandOptionEnum.importMode]: {
		name: ActionCommandOptionEnum.importMode,
		description: 'The import mode to use.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: ActionImportModeChoicesEnum.overwriteAll,
				value: ActionImportModeChoicesEnum.overwriteAll,
			},
			{
				name: ActionImportModeChoicesEnum.overwriteOnConflict,
				value: ActionImportModeChoicesEnum.overwriteOnConflict,
			},
			{
				name: ActionImportModeChoicesEnum.renameOnConflict,
				value: ActionImportModeChoicesEnum.renameOnConflict,
			},
			{
				name: ActionImportModeChoicesEnum.ignoreOnConflict,
				value: ActionImportModeChoicesEnum.ignoreOnConflict,
			},
		],
	},
} satisfies CommandOptions;
