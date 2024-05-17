import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import L from '../../../i18n/i18n-node.js';

export class SettingsOptions {
	public static readonly SETTINGS_SET_OPTION: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.settingsSetOption.name(),
		description: L.en.commandOptions.settingsSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: L.en.commandOptions.settingsSetOption.choices.initTrackerNotifications.name(),
				value: L.en.commandOptions.settingsSetOption.choices.initTrackerNotifications.value(),
			},
			{
				name: L.en.commandOptions.settingsSetOption.choices.inlineRollsDisplay.name(),
				value: L.en.commandOptions.settingsSetOption.choices.inlineRollsDisplay.value(),
			},
			{
				name: L.en.commandOptions.settingsSetOption.choices.defaultCompendium.name(),
				value: L.en.commandOptions.settingsSetOption.choices.defaultCompendium.value(),
			},
		],
	};
	public static readonly SETTINGS_SET_VALUE: APIApplicationCommandBasicOption = {
		name: L.en.commandOptions.settingsSetValue.name(),
		description: L.en.commandOptions.settingsSetValue.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
}
