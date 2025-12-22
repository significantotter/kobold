import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

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

/**
 * Modifier set option choices
 */
export const ModifierSetOptionChoices = {
	name: 'name',
	description: 'description',
	type: 'type',
	rollAdjustment: 'roll-adjustment',
	rollTargetTags: 'roll-target-tags',
	sheetValues: 'sheet-values',
	severity: 'severity',
	initiativeNote: 'initiative-note',
} as const;

/**
 * Modifier import mode choices
 */
export const ModifierImportModeChoices = {
	overwriteAll: 'overwrite-all',
	overwriteOnConflict: 'overwrite-on-conflict',
	renameOnConflict: 'rename-on-conflict',
	ignoreOnConflict: 'ignore-on-conflict',
} as const;

/**
 * Modifier type choices
 */
export const ModifierTypeChoices = {
	status: 'status',
	item: 'item',
	circumstance: 'circumstance',
	untyped: 'untyped',
} as const;

/**
 * Modifier custom filter choices
 */
export const ModifierCustomChoices = {
	custom: 'custom',
	default: 'default',
	both: 'both',
} as const;

/**
 * Option choice values for modifier command - source of truth for option value comparisons
 */
export const modifierOptionChoices = {
	setOption: ModifierSetOptionChoices,
	importMode: ModifierImportModeChoices,
	type: ModifierTypeChoices,
	custom: ModifierCustomChoices,
} as const;

export const modifierCommandOptions = {
	[ModifierCommandOptionEnum.custom]: {
		name: 'custom',
		description: 'Whether to view custom created modifiers, default modifiers, or both.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(ModifierCustomChoices).map(value => ({
			name: value,
			value: value,
		})),
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
		choices: Object.values(ModifierTypeChoices).map(value => ({
			name: value,
			value: value,
		})),
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
		choices: Object.values(ModifierSetOptionChoices).map(value => ({
			name: value,
			value: value,
		})),
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
		choices: Object.values(ModifierImportModeChoices).map(value => ({
			name: value,
			value: value,
		})),
	},
	[ModifierCommandOptionEnum.importUrl]: {
		name: 'url',
		description: 'The pastebin url with the modifier code to import.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<ModifierCommandOptionEnum>;
