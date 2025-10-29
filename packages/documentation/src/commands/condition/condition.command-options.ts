import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.ts';

export enum ConditionCommandOptionEnum {
	name = 'name',
}

export const conditionCommandOptions: CommandOptions = {
	[ConditionCommandOptionEnum.name]: {
		name: 'name',
		description: 'the name of the condition',
		autocomplete: true,
		required: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<ConditionCommandOptionEnum>;
