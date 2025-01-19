import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.d.js';

export enum CounterGroupCommandOptionEnum {
	counterGroupName = 'name',
	counterGroupDescription = 'description',
	counterGroupReorderCounter = 'reorder-counter',
	counterGroupSetOption = 'set-option',
	counterGroupSetValue = 'value',
}

export const counterGroupCommandOptions: CommandOptions = {
	[CounterGroupCommandOptionEnum.counterGroupName]: {
		name: CounterGroupCommandOptionEnum.counterGroupName,
		description: 'The name of the counter group.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[CounterGroupCommandOptionEnum.counterGroupDescription]: {
		name: CounterGroupCommandOptionEnum.counterGroupDescription,
		description: 'The description of the counter group.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[CounterGroupCommandOptionEnum.counterGroupReorderCounter]: {
		name: CounterGroupCommandOptionEnum.counterGroupReorderCounter,
		description: 'The name of the counter to change the position of in the group.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'top',
				value: 'top',
			},
			{
				name: 'up',
				value: 'up',
			},
			{
				name: 'down',
				value: 'down',
			},
			{
				name: 'bottom',
				value: 'bottom',
			},
		],
	},
	[CounterGroupCommandOptionEnum.counterGroupSetOption]: {
		name: CounterGroupCommandOptionEnum.counterGroupSetOption,
		description: 'The field to set to a new value.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'name',
				value: 'name',
			},
			{
				name: 'description',
				value: 'description',
			},
		],
	},
	[CounterGroupCommandOptionEnum.counterGroupSetValue]: {
		name: CounterGroupCommandOptionEnum.counterGroupSetValue,
		description: 'The value to change the option to.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<CounterGroupCommandOptionEnum>;
