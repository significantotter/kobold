import type { CommandReference } from '../helpers/commands.types.js';
import { settingCommandDefinition, SettingSubCommandEnum } from './setting.command-definition.js';
import { SettingCommandOptionEnum, settingCommandOptions } from './setting.command-options.js';
import { settingCommandDocumentation } from './setting.documentation.js';

export * from './setting.command-definition.js';
export * from './setting.documentation.js';
export * from './setting.command-options.js';

export const SettingDefinition = {
	definition: settingCommandDefinition,
	documentation: settingCommandDocumentation,
	options: settingCommandOptions,
	subCommandEnum: SettingSubCommandEnum,
	commandOptionsEnum: SettingCommandOptionEnum,
} satisfies CommandReference;
