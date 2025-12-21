import type { CommandReference } from '../helpers/commands.types.js';
import {
	counterGroupCommandDefinition,
	CounterGroupSubCommandEnum,
} from './counter-group.command-definition.js';
import {
	CounterGroupCommandOptionEnum,
	counterGroupCommandOptions,
	counterGroupOptionChoices,
} from './counter-group.command-options.js';
import { counterGroupCommandDocumentation } from './counter-group.documentation.js';
import { counterGroupStrings } from './counter-group.strings.js';

export * from './counter-group.command-definition.js';
export * from './counter-group.documentation.js';
export * from './counter-group.command-options.js';

export const CounterGroupDefinition = {
	definition: counterGroupCommandDefinition,
	documentation: counterGroupCommandDocumentation,
	options: counterGroupCommandOptions,
	subCommandEnum: CounterGroupSubCommandEnum,
	commandOptionsEnum: CounterGroupCommandOptionEnum,
	strings: counterGroupStrings,
	optionChoices: counterGroupOptionChoices,
} satisfies CommandReference;
