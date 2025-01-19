import type { CommandReference } from '../helpers/commands.d.js';
import { settingCommandDefinition } from './setting.command-definition.js';
import { settingCommandOptions } from './setting.command-options.js';
import { settingCommandDocumentation } from './setting.documentation.js';

export * from './setting.command-definition.js';
export * from './setting.documentation.js';
export * from './setting.command-options.js';

export const SettingCommand = {
	definition: settingCommandDefinition,
	documentation: settingCommandDocumentation,
	options: settingCommandOptions,
} satisfies CommandReference;
