import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { SpecificCommandOptions } from '../helpers/commands.types.js';

export enum MinionCommandOptionEnum {
	name = 'name',
	minion = 'minion',
	stats = 'stats',
	attribute = 'attribute',
	value = 'value',
	rollType = 'roll-type',
	targetCharacter = 'character',
	diceRollOrModifier = 'dice-roll-or-modifier',
	skillChoice = 'skill',
	rollExpression = 'dice',
	rollSecret = 'secret',
}

export const minionCommandOptions = {
	[MinionCommandOptionEnum.name]: {
		name: MinionCommandOptionEnum.name,
		description: 'The name of the minion.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[MinionCommandOptionEnum.minion]: {
		name: MinionCommandOptionEnum.minion,
		description: 'The target minion',
		type: ApplicationCommandOptionType.String,
		required: true,
		autocomplete: true,
	},
	[MinionCommandOptionEnum.stats]: {
		name: MinionCommandOptionEnum.stats,
		description: 'The minion statblock.',
		type: ApplicationCommandOptionType.String,
		required: false,
		autocomplete: true,
	},
	[MinionCommandOptionEnum.attribute]: {
		name: MinionCommandOptionEnum.attribute,
		description: 'The attribute to set (e.g., hp, ac, level)',
		type: ApplicationCommandOptionType.String,
		required: true,
		autocomplete: true,
	},
	[MinionCommandOptionEnum.value]: {
		name: MinionCommandOptionEnum.value,
		description: 'The value to set the attribute to',
		type: ApplicationCommandOptionType.String,
		required: true,
	},
	[MinionCommandOptionEnum.rollType]: {
		name: MinionCommandOptionEnum.rollType,
		description: 'The type of roll for the characters to make',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[MinionCommandOptionEnum.targetCharacter]: {
		name: MinionCommandOptionEnum.targetCharacter,
		description: 'The target character',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[MinionCommandOptionEnum.diceRollOrModifier]: {
		name: MinionCommandOptionEnum.diceRollOrModifier,
		description: 'The dice roll if doing a custom roll, or a modifier to add to the roll.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[MinionCommandOptionEnum.skillChoice]: {
		name: MinionCommandOptionEnum.skillChoice,
		description: 'The skill to roll.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[MinionCommandOptionEnum.rollExpression]: {
		name: MinionCommandOptionEnum.rollExpression,
		description: 'The dice expression to roll. Similar to Roll20 dice rolls.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[MinionCommandOptionEnum.rollSecret]: {
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
} satisfies SpecificCommandOptions<MinionCommandOptionEnum>;
