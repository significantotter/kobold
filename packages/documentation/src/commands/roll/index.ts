import type { CommandReference } from '../helpers/commands.types.js';
import { rollCommandDefinition, RollSubCommandEnum } from './roll.command-definition.js';
import { RollCommandOptionEnum, rollCommandOptions } from './roll.command-options.js';
import { rollCommandDocumentation } from './roll.documentation.js';
import { rollStrings, rollOptionChoices } from './roll.strings.js';

export * from './roll.command-definition.js';
export * from './roll.documentation.js';
export * from './roll.command-options.js';
export * from './roll.strings.js';

export const RollDefinition = {
	definition: rollCommandDefinition,
	documentation: rollCommandDocumentation,
	options: rollCommandOptions,
	subCommandEnum: RollSubCommandEnum,
	commandOptionsEnum: RollCommandOptionEnum,
	strings: rollStrings,
	optionChoices: rollOptionChoices,
} satisfies CommandReference;
