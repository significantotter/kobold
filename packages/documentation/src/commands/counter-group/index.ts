import type { CommandReference } from '../helpers/commands.d.js';
import { counterGroupCommandDefinition } from './counter-group.command-definition.js';
import { counterGroupCommandOptions } from './counter-group.command-options.js';
import { counterGroupCommandDocumentation } from './counter-group.documentation.js';

export * from './counter-group.command-definition.js';
export * from './counter-group.documentation.js';
export * from './counter-group.command-options.js';

export const CounterGroupCommand = {
	definition: counterGroupCommandDefinition,
	documentation: counterGroupCommandDocumentation,
	options: counterGroupCommandOptions,
} satisfies CommandReference;
