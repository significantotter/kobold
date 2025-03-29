import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import { SettingCommandOptionEnum, settingCommandOptions } from './setting.command-options.js';

export enum SettingSubCommandEnum {
	set = 'set',
}

export const settingCommandDefinition = {
	metadata: {
		name: 'settings',
		description: 'Settings to customize your experience with Kobold.',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[SettingSubCommandEnum.set]: {
			name: SettingSubCommandEnum.set,
			description: 'Set a user setting.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[SettingCommandOptionEnum.set]: settingCommandOptions[SettingCommandOptionEnum.set],
				[SettingCommandOptionEnum.value]:
					settingCommandOptions[SettingCommandOptionEnum.value],
			},
		},
	},
} satisfies CommandDefinition<SettingSubCommandEnum>;

/**
 * Command Definition:
 *
		type: ApplicationCommandType.ChatInput,
		name: L.en.commands.settings.name(),
		description: L.en.commands.settings.description(),
		dm_permission: true,
		default_member_permissions: undefined,

		options: [
			{
				name: L.en.commands.settings.set.name(),
				description: L.en.commands.settings.set.description(),
				type: ApplicationCommandOptionType.Subcommand,
				options: [SettingsOptions.SETTINGS_SET_OPTION, SettingsOptions.SETTINGS_SET_VALUE],
			},
		],
 *
 * Command Options:
 *
 * import { APIApplicationCommandBasicOption, ApplicationCommandOptionType } from 'discord.js';
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

 * 
 * L.en.commandOptions
 *
	settingsSetOption: {
		name: 'option',
		description: 'The option to update.',
		choices: {
			initTrackerNotifications: {
				name: 'initiative-tracker-notifications',
				value: 'initiative-tracker-notifications',
			},
			inlineRollsDisplay: {
				name: 'inline-rolls-display',
				value: 'inline-rolls-display',
			},
			defaultCompendium: {
				name: 'default-compendium',
				value: 'default-compendium',
			},
		},
	},
	settingsSetValue: {
		name: 'value',
		description: 'The value to set the option to.',
	},

 * 
 * L.en.commands
 * 
 *
 export default {
	name: 'settings',
	description: 'Settings to customize your experience with Kobold.',

	set: {
		name: 'set',
		description: 'Set a user setting.',
		options: '[option] [value]',
		usage:
			'**[option]**: Which setting to change.\n' +
			'**[value]**: What to update the setting to.\n',
	},
};
 *
 */
