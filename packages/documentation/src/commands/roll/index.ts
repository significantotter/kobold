import type { CommandReference } from '../helpers/commands.d.js';
import { rollCommandDefinition } from './roll.command-definition.js';
import { rollCommandOptions } from './roll.command-options.js';
import { rollCommandDocumentation } from './roll.documentation.js';

export * from './roll.command-definition.js';
export * from './roll.documentation.js';
export * from './roll.command-options.js';

export const RollCommand = {
	definition: rollCommandDefinition,
	documentation: rollCommandDocumentation,
	options: rollCommandOptions,
} satisfies CommandReference;
