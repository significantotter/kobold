import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.d.ts';
import { SettingCommandOptionEnum, settingCommandOptions } from './setting.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum SettingSubCommandEnum {
	set = 'set',
}

export const settingCommandDefinition = {
	metadata: {
		name: 'settings',
		description: 'Settings to customize your experience with Kobold.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[SettingSubCommandEnum.set]: {
			name: SettingSubCommandEnum.set,
			description: 'Set a user setting.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[SettingCommandOptionEnum.set]: withOrder(
					settingCommandOptions[SettingCommandOptionEnum.set],
					1
				),
				[SettingCommandOptionEnum.value]: withOrder(
					settingCommandOptions[SettingCommandOptionEnum.value],
					2
				),
			},
		},
	},
} satisfies CommandDefinition<SettingSubCommandEnum>;
