import { ApplicationCommandOptionType } from 'discord-api-types/v10';
import type { CommandOptions, SpecificCommandOptions } from '../helpers/commands.types.js';

export enum CounterCommandOptionEnum {
	counterName = 'name',
	counterText = 'text',
	counterGroupName = 'group-name',
	counterDescription = 'description',
	counterStyle = 'style',
	counterMax = 'max',
	counterRecoverable = 'recoverable',
	counterListHideGroups = 'hide-groups',
	counterRecoverTo = 'recover-to',
	counterSetOption = 'set-option',
	counterSetValue = 'value',
	counterSlot = 'slot',
	counterPrepareSlot = 'ability',
	counterPrepareMany = 'values',
	counterPrepareFresh = 'prepare-fresh',
	counterResetSlot = 'reset-slot',
	counterValue = 'counter-value',
}

/**
 * Choice values for options with predefined choices.
 * Access via CounterCommand.optionChoices.setOption.name etc.
 */
export const counterOptionChoices = {
	/** Choices for the counterSetOption option */
	setOption: {
		name: 'name',
		description: 'description',
		style: 'style',
		max: 'max',
		text: 'text',
		recoverTo: 'recoverTo',
		recoverable: 'recoverable',
	},
} as const;

/** @deprecated Use counterOptionChoices.setOption instead */
export const CounterSetOptionChoices = counterOptionChoices.setOption;

export type CounterSetOptionChoice =
	(typeof counterOptionChoices.setOption)[keyof typeof counterOptionChoices.setOption];

export const counterCommandOptions = {
	[CounterCommandOptionEnum.counterName]: {
		name: CounterCommandOptionEnum.counterName,
		description: 'The name of the counter.',
		autocomplete: true,
		choices: undefined,
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[CounterCommandOptionEnum.counterText]: {
		name: CounterCommandOptionEnum.counterText,
		description: 'The text for the counter.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[CounterCommandOptionEnum.counterGroupName]: {
		name: CounterCommandOptionEnum.counterGroupName,
		description: 'The name of the counter group.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[CounterCommandOptionEnum.counterDescription]: {
		name: CounterCommandOptionEnum.counterDescription,
		description: 'The description of the counter.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[CounterCommandOptionEnum.counterStyle]: {
		name: CounterCommandOptionEnum.counterStyle,
		description: 'The style of the counter.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: 'prepared',
				value: 'prepared',
			},
			{
				name: 'default',
				value: 'default',
			},
			{
				name: 'dots',
				value: 'dots',
			},
		],
	},
	[CounterCommandOptionEnum.counterMax]: {
		name: CounterCommandOptionEnum.counterMax,
		description: 'The max value of the counter.',
		required: false,
		type: ApplicationCommandOptionType.Number,
	},
	[CounterCommandOptionEnum.counterRecoverable]: {
		name: CounterCommandOptionEnum.counterRecoverable,
		description: 'Whether the counter is reset when using the recover command.',
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	},
	[CounterCommandOptionEnum.counterListHideGroups]: {
		name: CounterCommandOptionEnum.counterListHideGroups,
		description: 'Whether to hide counter groups.',
		required: false,
		type: ApplicationCommandOptionType.String,
	},
	[CounterCommandOptionEnum.counterRecoverTo]: {
		name: CounterCommandOptionEnum.counterRecoverTo,
		description: 'The value used after the recover command. -1 is max, -2 is half max.',
		required: false,
		type: ApplicationCommandOptionType.Number,
	},
	[CounterCommandOptionEnum.counterSetOption]: {
		name: CounterCommandOptionEnum.counterSetOption,
		description: 'The field to set to a new value.',
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: Object.values(counterOptionChoices.setOption).map(value => ({
			name: value,
			value: value,
		})),
	},
	[CounterCommandOptionEnum.counterSetValue]: {
		name: CounterCommandOptionEnum.counterSetValue,
		description: 'The value to change the option to.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[CounterCommandOptionEnum.counterSlot]: {
		name: CounterCommandOptionEnum.counterSlot,
		description: 'The slot to use for the counter.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[CounterCommandOptionEnum.counterPrepareSlot]: {
		name: CounterCommandOptionEnum.counterPrepareSlot,
		description: "The ability to prepare in the counter's slot.",
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[CounterCommandOptionEnum.counterPrepareMany]: {
		name: CounterCommandOptionEnum.counterPrepareMany,
		description: 'The abilities to prepare in the counter, separated by commas.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
	[CounterCommandOptionEnum.counterPrepareFresh]: {
		name: CounterCommandOptionEnum.counterPrepareFresh,
		description: 'Whether to overwrite all existing values before preparing.',
		required: true,
		type: ApplicationCommandOptionType.Boolean,
	},
	[CounterCommandOptionEnum.counterResetSlot]: {
		name: CounterCommandOptionEnum.counterResetSlot,
		description: 'Whether to reset the slot to "unused" instead of using it.',
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	},
	[CounterCommandOptionEnum.counterValue]: {
		name: CounterCommandOptionEnum.counterValue,
		description: 'The value to set the counter to.',
		required: true,
		type: ApplicationCommandOptionType.String,
	},
} satisfies SpecificCommandOptions<CounterCommandOptionEnum>;
