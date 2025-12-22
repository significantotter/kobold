import type { CommandReference } from '../helpers/commands.types.js';
import { counterCommandDefinition, CounterSubCommandEnum } from './counter.command-definition.js';
import {
	CounterCommandOptionEnum,
	counterCommandOptions,
	counterOptionChoices,
} from './counter.command-options.js';
import { counterCommandDocumentation } from './counter.documentation.js';
import { counterStrings } from './counter.strings.js';

export * from './counter.command-definition.js';
export * from './counter.documentation.js';
export * from './counter.command-options.js';

export const CounterDefinition = {
	definition: counterCommandDefinition,
	documentation: counterCommandDocumentation,
	options: counterCommandOptions,
	subCommandEnum: CounterSubCommandEnum,
	commandOptionsEnum: CounterCommandOptionEnum,
	strings: counterStrings,
	optionChoices: counterOptionChoices,
} satisfies CommandReference;
