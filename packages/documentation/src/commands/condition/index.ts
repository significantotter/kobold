import type { CommandReference } from '../helpers/commands.types.js';
import {
	conditionCommandDefinition,
	ConditionSubCommandEnum,
} from './condition.command-definition.js';
import {
	ConditionCommandOptionEnum,
	conditionCommandOptions,
} from './condition.command-options.js';
import { conditionCommandDocumentation } from './condition.documentation.js';
import { conditionStrings, conditionOptionChoices } from './condition.strings.js';

export * from './condition.command-definition.js';
export * from './condition.documentation.js';
export * from './condition.command-options.js';
export * from './condition.strings.js';

export const ConditionDefinition = {
	definition: conditionCommandDefinition,
	documentation: conditionCommandDocumentation,
	options: conditionCommandOptions,
	subCommandEnum: ConditionSubCommandEnum,
	commandOptionsEnum: ConditionCommandOptionEnum,
	strings: conditionStrings,
	optionChoices: conditionOptionChoices,
} satisfies CommandReference;
