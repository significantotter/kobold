import type { CommandDocumentation } from '../helpers/commands.types.js';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import { settingCommandDefinition, SettingSubCommandEnum } from './setting.command-definition.js';
import { SettingCommandOptionEnum } from './setting.command-options.js';

export const settingCommandDocumentation: CommandDocumentation<typeof settingCommandDefinition> = {
	name: 'setting',
	description: 'Commands for managing settings.',
	subCommands: {
		[SettingSubCommandEnum.set]: {
			name: SettingSubCommandEnum.set,
			description: 'Set a user setting.',
			usage:
				'**[option]**: Which setting to change.\n' +
				'**[value]**: What to update the setting to.\n',
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[SettingCommandOptionEnum.set]: 'inline-rolls-display',
						[SettingCommandOptionEnum.value]: 'compact',
					},
					message: 'Yip! "inline-rolls-display" has been set to "compact".',
				},
			],
		},
	},
};
