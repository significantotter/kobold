import { APIApplicationCommandStringOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class CounterOptions {
	public static readonly COUNTER_NAME_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterName.name(),
		description: L.en.commandOptions.counterName.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
	};
	public static readonly COUNTER_DESCRIPTION_OPTION: APIApplicationCommandStringOption = {
		name: L.en.commandOptions.counterDescription.name(),
		description: L.en.commandOptions.counterDescription.description(),
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
				name: L.en.commandOptions.counterSetOption.choices.description.name(),
				value: L.en.commandOptions.counterSetOption.choices.description.value(),
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
