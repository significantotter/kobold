import type { CommandReference } from '../helpers/commands.types.js';
import { actionCommandDefinition, ActionSubCommandEnum } from './action.command-definition.js';
import {
	ActionCommandOptionEnum,
	actionCommandOptions,
	actionOptionChoices,
} from './action.command-options.js';
import { actionCommandDocumentation } from './action.documentation.js';
import { actionStrings } from './action.strings.js';

export * from './action.command-definition.js';
export * from './action.documentation.js';
export * from './action.command-options.js';
export * from './action.strings.js';

export const ActionDefinition = {
	definition: actionCommandDefinition,
	documentation: actionCommandDocumentation,
	options: actionCommandOptions,
	subCommandEnum: ActionSubCommandEnum,
	commandOptionsEnum: ActionCommandOptionEnum,
	strings: actionStrings,
	optionChoices: actionOptionChoices,
} satisfies CommandReference;
