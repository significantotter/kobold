import type { CommandReference } from '../helpers/commands.d.ts';
import { settingCommandDefinition, SettingSubCommandEnum } from './setting.command-definition.js';
import { settingCommandOptions } from './setting.command-options.js';
import { settingCommandDocumentation } from './setting.documentation.js';

export * from './setting.command-definition.js';
export * from './setting.documentation.js';
export * from './setting.command-options.js';

export const SettingCommand = {
	definition: settingCommandDefinition,
	documentation: settingCommandDocumentation,
	options: settingCommandOptions,
	subCommandEnum: SettingSubCommandEnum,
} satisfies CommandReference;
