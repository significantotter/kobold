import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

export enum CounterGroupCommandOptionEnum {
	counterGroupName = 'name',
	counterGroupDescription = 'description',
	counterGroupReorderCounter = 'reorder-counter',
	counterGroupSetOption = 'set-option',
	counterGroupSetValue = 'value',
}

/**
 * Choice values for options with predefined choices.
 * Access via CounterGroupCommand.optionChoices.setOption.name etc.
 */
export const counterGroupOptionChoices = {
	/** Choices for the counterGroupSetOption option */
	setOption: {
		name: 'name',
		description: 'description',
	},
	/** Choices for the counterGroupReorderCounter option */
	reorderCounter: {
		top: 'top',
		up: 'up',
		down: 'down',
		bottom: 'bottom',
	},
} as const;

export const counterGroupCommandOptions = {
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
		choices: Object.values(counterGroupOptionChoices.reorderCounter).map(value => ({
			name: value,
			value: value,
		})),
	},
	[CounterGroupCommandOptionEnum.counterGroupSetOption]: {
		name: CounterGroupCommandOptionEnum.counterGroupSetOption,
		description: 'The field to set to a new value.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(counterGroupOptionChoices.setOption).map(value => ({
			name: value,
			value: value,
		})),
	},
	[CounterGroupCommandOptionEnum.counterGroupSetValue]: {
		name: CounterGroupCommandOptionEnum.counterGroupSetValue,
		description: 'The value to change the option to.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<CounterGroupCommandOptionEnum>;
