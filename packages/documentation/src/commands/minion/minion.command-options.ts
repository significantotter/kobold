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
	exportFormat = 'export-format',
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
		description: 'Custom stats to set (e.g., "hp=10; ac=15; athletics=+5")',
		type: ApplicationCommandOptionType.String,
		required: true,
	},
	[MinionCommandOptionEnum.attribute]: {
		name: MinionCommandOptionEnum.attribute,
		description: "What option to update on the minion's sheet",
		type: ApplicationCommandOptionType.String,
		required: true,
		choices: [
			{
				name: 'hp',
				value: 'hp',
			},
			{
				name: 'tempHp',
				value: 'tempHp',
			},
			{
				name: 'stamina',
				value: 'stamina',
			},
			{
				name: 'resolve',
				value: 'resolve',
			},
			{
				name: 'hero points',
				value: 'hero-points',
			},
			{
				name: 'focus points',
				value: 'focus-points',
			},
		],
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
	[MinionCommandOptionEnum.exportFormat]: {
		name: MinionCommandOptionEnum.exportFormat,
		description: 'Export the sheet in a format that can be re-imported',
		type: ApplicationCommandOptionType.Boolean,
		required: false,
	},
} satisfies SpecificCommandOptions<MinionCommandOptionEnum>;
