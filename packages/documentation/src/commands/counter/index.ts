import type { CommandReference } from '../helpers/commands.d.js';
import { counterCommandDefinition } from './counter.command-definition.js';
import { counterCommandOptions } from './counter.command-options.js';
import { counterCommandDocumentation } from './counter.documentation.js';

export * from './counter.command-definition.js';
export * from './counter.documentation.js';
export * from './counter.command-options.js';

export const CounterCommand = {
	definition: counterCommandDefinition,
	documentation: counterCommandDocumentation,
	options: counterCommandOptions,
} satisfies CommandReference;
