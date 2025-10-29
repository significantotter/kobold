import type { CommandReference } from '../helpers/commands.d.ts';
import { initCommandDefinition, InitSubCommandEnum } from './init.command-definition.js';
import { initCommandOptions } from './init.command-options.js';
import { initCommandDocumentation } from './init.documentation.js';

export * from './init.command-definition.js';
export * from './init.documentation.js';
export * from './init.command-options.js';

export const InitCommand = {
	definition: initCommandDefinition,
	documentation: initCommandDocumentation,
	options: initCommandOptions,
	subCommandEnum: InitSubCommandEnum,
} satisfies CommandReference;
