import { APIApplicationCommandStringOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class CounterGroupOptions {
	public static readonly COUNTER_GROUP_NAME_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterGroupName.name(),
		description: L.en.commandOptions.counterGroupName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_GROUP_DESCRIPTION_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterGroupDescription.name(),
		description: L.en.commandOptions.counterGroupDescription.description(),
		required: false,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_GROUP_REORDER_COUNTER_OPTION: APIApplicationCommandStringOption =
		{
			name: L.en.commandOptions.counterGroupReorderCounter.name(),
			description: L.en.commandOptions.counterGroupReorderCounter.description(),
			required: true,
			choices: [
				{
					name: L.en.commandOptions.counterGroupReorderCounter.choices.top.name(),
					value: L.en.commandOptions.counterGroupReorderCounter.choices.top.value(),
				},
				{
					name: L.en.commandOptions.counterGroupReorderCounter.choices.up.name(),
					value: L.en.commandOptions.counterGroupReorderCounter.choices.up.value(),
				},
				{
					name: L.en.commandOptions.counterGroupReorderCounter.choices.down.name(),
					value: L.en.commandOptions.counterGroupReorderCounter.choices.down.value(),
				},
				{
					name: L.en.commandOptions.counterGroupReorderCounter.choices.bottom.name(),
					value: L.en.commandOptions.counterGroupReorderCounter.choices.bottom.value(),
				},
			],
			type: ApplicationCommandOptionType.String,
		};
	public static readonly COUNTER_GROUP_SET_OPTION_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterGroupSetOption.name(),
		description: L.en.commandOptions.counterGroupSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.counterGroupSetOption.choices.name.name(),
				value: L.en.commandOptions.counterGroupSetOption.choices.name.value(),
			},
			{
				name: L.en.commandOptions.counterGroupSetOption.choices.description.name(),
				value: L.en.commandOptions.counterGroupSetOption.choices.description.value(),
			},
		],
	};
	public static readonly COUNTER_GROUP_SET_VALUE_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterGroupSetValue.name(),
		description: L.en.commandOptions.counterGroupSetValue.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
}
