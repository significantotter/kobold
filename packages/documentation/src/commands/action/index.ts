import type { CommandReference } from '../helpers/commands.d.js';
import { actionCommandDefinition } from './action.command-definition.js';
import { actionCommandOptions } from './action.command-options.js';
import { actionCommandDocumentation } from './action.documentation.js';

export * from './action.command-definition.js';
export * from './action.documentation.js';
export * from './action.command-options.js';

export const ActionCommand = {
	definition: actionCommandDefinition,
	documentation: actionCommandDocumentation,
	options: actionCommandOptions,
} satisfies CommandReference;
