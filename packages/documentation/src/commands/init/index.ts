import type { CommandReference } from '../helpers/commands.d.js';
import { initCommandDefinition } from './init.command-definition.js';
import { initCommandOptions } from './init.command-options.js';
import { initCommandDocumentation } from './init.documentation.js';

export * from './init.command-definition.js';
export * from './init.documentation.js';
export * from './init.command-options.js';

export const InitCommand = {
	definition: initCommandDefinition,
	documentation: initCommandDocumentation,
	options: initCommandOptions,
} satisfies CommandReference;
