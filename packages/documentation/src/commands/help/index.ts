import type { CommandReference } from '../helpers/commands.types.js';
import { helpCommandDefinition, HelpSubCommandEnum } from './help.command-definition.js';
import { HelpCommandOptionEnum, helpCommandOptions } from './help.command-options.js';
import { helpCommandDocumentation } from './help.documentation.js';

export * from './help.command-definition.js';
export * from './help.documentation.js';
export * from './help.command-options.js';
export * from './help.content.js';

export const HelpDefinition = {
	definition: helpCommandDefinition,
	documentation: helpCommandDocumentation,
	options: helpCommandOptions,
	subCommandEnum: HelpSubCommandEnum,
	commandOptionsEnum: HelpCommandOptionEnum,
} satisfies CommandReference;
