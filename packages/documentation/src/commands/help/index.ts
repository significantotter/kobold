import type { CommandReference } from '../helpers/commands.d.js';
import { helpCommandDefinition } from './help.command-definition.js';
import { helpCommandOptions } from './help.command-options.js';
import { helpCommandDocumentation } from './help.documentation.js';

export * from './help.command-definition.js';
export * from './help.documentation.js';
export * from './help.command-options.js';

export const HelpCommand = {
	definition: helpCommandDefinition,
	documentation: helpCommandDocumentation,
	options: helpCommandOptions,
} satisfies CommandReference;
