import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.js';

export enum ActionStageCommandOptionEnum {
	actionTarget = 'action-target',
	allowModifiers = 'allow-modifiers',
	healInsteadOfDamage = 'heal-instead-of-damage',
	target = 'target',
	defendingStat = 'defending-stat',
	editOption = 'edit-option',
	editValue = 'edit-value',
	moveOption = 'move-option',
	targetDc = 'target-dc',
	abilityDc = 'ability-dc',
	saveRollType = 'save-roll-type',
	rollType = 'roll-type',
	rollName = 'roll-name',
	diceRoll = 'dice-roll',
	damageType = 'damage-type',
	basicDamageDiceRoll = 'basic-damage-dice-roll',
	successDiceRoll = 'success-dice-roll',
	criticalSuccessDiceRoll = 'critical-success-dice-roll',
	criticalFailureDiceRoll = 'critical-failure-dice-roll',
	failureDiceRoll = 'failure-dice-roll',
	defaultText = 'default-text',
	successText = 'success-text',
	criticalSuccessText = 'critical-success-text',
	criticalFailureText = 'critical-failure-text',
	failureText = 'failure-text',
	extraTags = 'extra-tags',
}

export enum ActionStageRollTypeOptionChoicesEnum {
	attack = 'attack',
	damage = 'damage',
	other = 'other',
}

export enum ActionStageMoveOptionChoicesEnum {
	top = 'top',
	bottom = 'bottom',
}

export const actionStageCommandOptions: CommandOptions = {
	[ActionStageCommandOptionEnum.actionTarget]: {
		name: 'action',
		description: 'The target action.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.allowModifiers]: {
		name: 'allow-modifiers',
		description: 'Allow modifiers for the roll.',
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	},
	[ActionStageCommandOptionEnum.defendingStat]: {
		name: 'defending-stat',
		description: "Whether you're targeting AC, a save, or a skill DC.",
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.healInsteadOfDamage]: {
		name: 'heal-instead-of-damage',
		description: 'Heal instead of dealing damage.',
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	},
	[ActionStageCommandOptionEnum.target]: {
		name: 'target',
		description: 'The target of the roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.editOption]: {
		name: 'edit-option',
		description: 'The option to edit.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.editValue]: {
		name: 'edit-value',
		description: 'The value to set for the option.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.moveOption]: {
		name: 'move-option',
		description: 'Move the option to a new position.',
		required: false,
		choices: [
			{
				name: ActionStageMoveOptionChoicesEnum.top,
				value: ActionStageMoveOptionChoicesEnum.top,
			},
			{
				name: ActionStageMoveOptionChoicesEnum.bottom,
				value: ActionStageMoveOptionChoicesEnum.bottom,
			},
		],
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.targetDc]: {
		name: 'target-dc',
		description: 'The target DC for the roll.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.abilityDc]: {
		name: 'ability-dc',
		description: 'The ability DC for the roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.saveRollType]: {
		name: 'save-roll-type',
		description: 'The type of save roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.rollType]: {
		name: 'roll-type',
		description: 'The type of roll.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: ActionStageRollTypeOptionChoicesEnum.attack,
				value: ActionStageRollTypeOptionChoicesEnum.attack,
			},
			{
				name: ActionStageRollTypeOptionChoicesEnum.damage,
				value: ActionStageRollTypeOptionChoicesEnum.damage,
			},
			{
				name: ActionStageRollTypeOptionChoicesEnum.other,
				value: ActionStageRollTypeOptionChoicesEnum.other,
			},
		],
	},
	[ActionStageCommandOptionEnum.rollName]: {
		name: 'roll-name',
		description: 'The name of the roll.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.diceRoll]: {
		name: 'dice-roll',
		description: 'The dice roll for the action.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.damageType]: {
		name: 'damage-type',
		description: 'The type of damage.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.basicDamageDiceRoll]: {
		name: 'basic-damage-dice-roll',
		description: 'The basic damage dice roll.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.successDiceRoll]: {
		name: 'success-dice-roll',
		description: 'The dice roll for a successful action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.criticalSuccessDiceRoll]: {
		name: 'critical-success-dice-roll',
		description: 'The dice roll for a critical success.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.criticalFailureDiceRoll]: {
		name: 'critical-failure-dice-roll',
		description: 'The dice roll for a critical failure.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.failureDiceRoll]: {
		name: 'failure-dice-roll',
		description: 'The dice roll for a failed action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.defaultText]: {
		name: 'default-text',
		description: 'The default text for the action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.successText]: {
		name: 'success-text',
		description: 'The text for a successful action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.criticalSuccessText]: {
		name: 'critical-success-text',
		description: 'The text for a critical success.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.criticalFailureText]: {
		name: 'critical-failure-text',
		description: 'The text for a critical failure.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.failureText]: {
		name: 'failure-text',
		description: 'The text for a failed action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[ActionStageCommandOptionEnum.extraTags]: {
		name: 'extra-tags',
		description: 'Extra tags for the action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<ActionStageCommandOptionEnum>;
