import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.ts';

export enum RollMacroCommandOptionEnum {
	name = 'name',
	value = 'value',
}

export const rollMacroCommandOptions: CommandOptions = {
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
} satisfies SpecificCommandOptions<RollMacroCommandOptionEnum>;
