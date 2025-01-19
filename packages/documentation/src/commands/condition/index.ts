import type { CommandReference } from '../helpers/commands.d.js';
import { conditionCommandDefinition } from './condition.command-definition.js';
import { conditionCommandOptions } from './condition.command-options.js';
import { conditionCommandDocumentation } from './condition.documentation.js';

export * from './condition.command-definition.js';
export * from './condition.documentation.js';
export * from './condition.command-options.js';

export const ConditionCommand = {
	definition: conditionCommandDefinition,
	documentation: conditionCommandDocumentation,
	options: conditionCommandOptions,
} satisfies CommandReference;
