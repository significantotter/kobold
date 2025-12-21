import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions } from '../helpers/commands.types.js';

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

export const ActionTypeChoices = {
	attack: 'attack',
	spell: 'spell',
	other: 'other',
} as const;

export const ActionCostChoices = {
	reaction: 'reaction',
	free: 'free-action',
	one: 'one-action',
	two: 'two-actions',
	three: 'three-actions',
	variable: 'variable-actions',
} as const;

export const ActionSetOptionChoices = {
	name: 'name',
	description: 'description',
	type: 'type',
	actionCost: 'action-cost',
	baseLevel: 'base-level',
	tags: 'tags',
	autoHeighten: 'auto-heighten',
} as const;

export const ActionImportModeChoices = {
	overwriteAll: 'overwrite-all',
	overwriteOnConflict: 'overwrite-on-conflict',
	renameOnConflict: 'rename-on-conflict',
	ignoreOnConflict: 'ignore-on-conflict',
} as const;

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
		choices: Object.values(ActionTypeChoices).map(value => ({
			name: value,
			value: value,
		})),
		type: ApplicationCommandOptionType.String,
	},
	[ActionCommandOptionEnum.actionCost]: {
		name: ActionCommandOptionEnum.actionCost,
		description: 'The number of actions used.',
		required: true,
		choices: Object.values(ActionCostChoices).map(value => ({
			name: value,
			value: value,
		})),
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
		choices: Object.values(ActionSetOptionChoices).map(value => ({
			name: value,
			value: value,
		})),
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
		choices: Object.values(ActionImportModeChoices).map(value => ({
			name: value,
			value: value,
		})),
	},
} satisfies CommandOptions;

/**
 * Choice values for action command options.
 * Uses existing enums as source of truth.
 */
export const actionOptionChoices = {
	/** Import mode choices */
	importMode: ActionImportModeChoices,
	/** Action type choices */
	actionType: ActionTypeChoices,
	/** Action cost choices */
	actionCost: ActionCostChoices,
	/** Set option choices */
	setOption: ActionSetOptionChoices,
} as const;
