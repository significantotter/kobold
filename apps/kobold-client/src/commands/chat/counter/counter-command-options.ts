import {
	APIApplicationCommandBooleanOption,
	APIApplicationCommandNumberOption,
	APIApplicationCommandStringOption,
	ApplicationCommandOptionType,
} from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class CounterOptions {
	public static readonly COUNTER_NAME_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterName.name(),
		description: L.en.commandOptions.counterName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_TEXT_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterText.name(),
		description: L.en.commandOptions.counterText.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_SLOT_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterSlot.name(),
		description: L.en.commandOptions.counterSlot.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_PREPARE_SLOT_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterPrepareSlot.name(),
		description: L.en.commandOptions.counterPrepareSlot.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_PREPARE_MANY_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterPrepareMany.name(),
		description: L.en.commandOptions.counterPrepareMany.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_PREPARE_FRESH_OPTION: APIApplicationCommandBooleanOption = {
		name: L.en.commandOptions.counterPrepareFresh.name(),
		description: L.en.commandOptions.counterPrepareFresh.description(),
		required: true,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly COUNTER_RESET_SLOT_OPTION: APIApplicationCommandBooleanOption = {
		name: L.en.commandOptions.counterResetSlot.name(),
		description: L.en.commandOptions.counterResetSlot.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly COUNTER_VALUE_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterValue.name(),
		description: L.en.commandOptions.counterValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_GROUP_NAME_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterCounterGroupName.name(),
		description: L.en.commandOptions.counterCounterGroupName.description(),
		required: false,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_DESCRIPTION_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterDescription.name(),
		description: L.en.commandOptions.counterDescription.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_RECOVER_TO_OPTION: APIApplicationCommandNumberOption = {
		name: L.en.commandOptions.counterRecoverTo.name(),
		description: L.en.commandOptions.counterRecoverTo.description(),
		required: false,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly COUNTER_STYLE_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterStyle.name(),
		description: L.en.commandOptions.counterStyle.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.counterStyle.choices.prepared.name(),
				value: L.en.commandOptions.counterStyle.choices.prepared.value(),
			},
			{
				name: L.en.commandOptions.counterStyle.choices.default.name(),
				value: L.en.commandOptions.counterStyle.choices.default.value(),
			},
			{
				name: L.en.commandOptions.counterStyle.choices.dots.name(),
				value: L.en.commandOptions.counterStyle.choices.dots.value(),
			},
		],
	};
	public static readonly COUNTER_MAX_OPTION: APIApplicationCommandNumberOption = {
		name: L.en.commandOptions.counterMax.name(),
		description: L.en.commandOptions.counterMax.description(),
		required: false,
		type: ApplicationCommandOptionType.Number,
	};
	public static readonly COUNTER_RECOVERABLE_OPTION: APIApplicationCommandBooleanOption = {
		name: L.en.commandOptions.counterRecoverable.name(),
		description: L.en.commandOptions.counterRecoverable.description(),
		required: false,
		type: ApplicationCommandOptionType.Boolean,
	};
	public static readonly COUNTER_LIST_HIDE_GROUPS_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterListHideGroups.name(),
		description: L.en.commandOptions.counterListHideGroups.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_SET_OPTION_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterSetOption.name(),
		description: L.en.commandOptions.counterSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.counterSetOption.choices.name.name(),
				value: L.en.commandOptions.counterSetOption.choices.name.value(),
			},
			{
				name: L.en.commandOptions.counterSetOption.choices.text.name(),
				value: L.en.commandOptions.counterSetOption.choices.text.value(),
			},
			{
				name: L.en.commandOptions.counterSetOption.choices.description.name(),
				value: L.en.commandOptions.counterSetOption.choices.description.value(),
			},
			{
				name: L.en.commandOptions.counterSetOption.choices.style.name(),
				value: L.en.commandOptions.counterSetOption.choices.style.value(),
			},
			{
				name: L.en.commandOptions.counterSetOption.choices.max.name(),
				value: L.en.commandOptions.counterSetOption.choices.max.value(),
			},
			{
				name: L.en.commandOptions.counterSetOption.choices.recoverable.name(),
				value: L.en.commandOptions.counterSetOption.choices.recoverable.value(),
			},
			{
				name: L.en.commandOptions.counterSetOption.choices.recoverTo.name(),
				value: L.en.commandOptions.counterSetOption.choices.recoverTo.value(),
			},
		],
	};
	public static readonly COUNTER_SET_VALUE_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterSetValue.name(),
		description: L.en.commandOptions.counterSetValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
