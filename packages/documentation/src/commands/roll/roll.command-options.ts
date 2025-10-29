import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.ts';

export enum RollCommandOptionEnum {
	rollExpression = 'dice',
	rollOverwriteAttack = 'overwrite-attack-roll',
	rollOverwriteSave = 'overwrite-save-roll',
	rollOverwriteDamage = 'overwrite-damage-roll',
	rollSecret = 'secret',
	skillChoice = 'skill',
	saveChoice = 'save',
	attackChoice = 'attack',
	rollModifier = 'modifier',
	attackRollModifier = 'attack_modifier',
	damageRollModifier = 'damage_modifier',
	heightenLevel = 'heighten',
	rollTargetDc = 'overwrite-dc',
	rollTargetAc = 'overwrite-ac',
	rollSaveDiceRoll = 'overwrite-save-dice-roll',
	rollNote = 'note',
}

export const rollCommandOptions: CommandOptions = {
	[RollCommandOptionEnum.rollExpression]: {
		name: 'dice',
		description: 'The dice expression to roll. Similar to Roll20 dice rolls.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollOverwriteAttack]: {
		name: 'overwrite-attack-roll',
		description: 'An alternate attack roll replacing all attack rolls',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollOverwriteSave]: {
		name: 'overwrite-save-roll',
		description: 'An alternate save roll replacing all save rolls',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollOverwriteDamage]: {
		name: 'overwrite-damage-roll',
		description: 'An alternate damage roll replacing the FIRST damage roll.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollSecret]: {
		name: 'secret',
		description: 'Whether to send the roll in a hidden, temporary message.',
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'public',
				value: 'public',
			},
			{
				name: 'secret',
				value: 'secret',
			},
			{
				name: 'secret-and-notify',
				value: 'secret-and-notify',
			},
			{
				name: 'send-to-gm',
				value: 'send-to-gm',
			},
		],
	},
	[RollCommandOptionEnum.skillChoice]: {
		name: 'skill',
		description: 'The skill to roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.saveChoice]: {
		name: 'save',
		description: 'The save to roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.attackChoice]: {
		name: 'attack',
		description: 'The attack to roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollModifier]: {
		name: 'modifier',
		description: 'A dice expression to modify your roll. (e.g. "+ 1 + 1d4")',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.attackRollModifier]: {
		name: 'attack_modifier',
		description: 'A dice expression to modify your attack roll. (e.g. "+ 1 + 1d4")',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.damageRollModifier]: {
		name: 'damage_modifier',
		description: 'A dice expression to modify your damage roll. (e.g. "+ 1 + 1d4")',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.heightenLevel]: {
		name: 'heighten',
		description: 'The level to heighten the action to.',
		required: false,
		type: ApplicationCommandOptionType.Integer,
	},
	[RollCommandOptionEnum.rollNote]: {
		name: 'note',
		description: 'A note about the reason for the roll.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[RollCommandOptionEnum.rollTargetDc]: {
		name: 'overwrite-dc',
		description: 'Provide a custom DC to roll attacks against.',
		required: false,
		type: ApplicationCommandOptionType.Integer,
	},
	[RollCommandOptionEnum.rollTargetAc]: {
		name: 'overwrite-ac',
		description: 'Provide a custom AC to roll the attack against.',
		required: false,
		type: ApplicationCommandOptionType.Integer,
	},
	[RollCommandOptionEnum.rollSaveDiceRoll]: {
		name: 'overwrite-save-dice-roll',
		description: 'Provide the dice roll to use for any saving throw in the action.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<RollCommandOptionEnum>;
