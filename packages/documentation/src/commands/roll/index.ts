import type { CommandReference } from '../helpers/commands.d.ts';
import { rollCommandDefinition, RollSubCommandEnum } from './roll.command-definition.js';
import { rollCommandOptions } from './roll.command-options.js';
import { rollCommandDocumentation } from './roll.documentation.js';

export * from './roll.command-definition.js';
export * from './roll.documentation.js';
export * from './roll.command-options.js';

export const RollCommand = {
	definition: rollCommandDefinition,
	documentation: rollCommandDocumentation,
	options: rollCommandOptions,
	subCommandEnum: RollSubCommandEnum,
} satisfies CommandReference;
