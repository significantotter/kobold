import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
import { Language } from '../../../models/enum-helpers/index.js';

export class SettingsOptions {
	public static readonly SETTINGS_SET_OPTION: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.settingsSetOption.name(),
		description: Language.LL.commandOptions.settingsSetOption.description(),
		required: true,
		type: ApplicationCommandOptionType.String,
		choices: [
			{
				name: Language.LL.commandOptions.settingsSetOption.choices.initTrackerNotifications.name(),
				value: Language.LL.commandOptions.settingsSetOption.choices.initTrackerNotifications.value(),
			},
		],
	};
	public static readonly SETTINGS_SET_VALUE: APIApplicationCommandBasicOption = {
		name: Language.LL.commandOptions.settingsSetValue.name(),
		description: Language.LL.commandOptions.settingsSetValue.description(),
		required: true,
		autocomplete: true,
		type: ApplicationCommandOptionType.String,
	};
}
