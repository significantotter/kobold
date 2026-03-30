import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

export enum RollMacroCommandOptionEnum {
	name = 'name',
	value = 'value',
	createFor = 'create-for',
	ownedBy = 'owned-by',
	assignTo = 'assign-to',
	copy = 'copy',
	targetMacro = 'macro',
}

export const rollMacroCommandOptions = {
	[RollMacroCommandOptionEnum.name]: {
		name: 'name',
		description: 'The name of the roll macro.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollMacroCommandOptionEnum.value]: {
		name: 'value',
		description:
			'A mini-roll expression. Must be able to evaluate on its own. Ex. "5" or "d4+[str]"',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollMacroCommandOptionEnum.createFor]: {
		name: RollMacroCommandOptionEnum.createFor,
		description: 'Create for a specific character/minion, or "Me" for user-wide (default: Me)',
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollMacroCommandOptionEnum.ownedBy]: {
		name: RollMacroCommandOptionEnum.ownedBy,
		description: 'Filter roll macros by owner (default: Everyone)',
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollMacroCommandOptionEnum.assignTo]: {
		name: RollMacroCommandOptionEnum.assignTo,
		description: 'The character or minion to assign the roll macro to, or "Me" for user-wide.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
	[RollMacroCommandOptionEnum.copy]: {
		name: RollMacroCommandOptionEnum.copy,
		description: 'Create a copy instead of moving the roll macro (default: false)',
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	},
	[RollMacroCommandOptionEnum.targetMacro]: {
		name: RollMacroCommandOptionEnum.targetMacro,
		description: 'The target roll macro.',
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<RollMacroCommandOptionEnum>;
