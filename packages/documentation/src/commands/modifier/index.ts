import type { CommandReference } from '../helpers/commands.types.js';
import {
	modifierCommandDefinition,
	ModifierSubCommandEnum,
} from './modifier.command-definition.js';
import {
	ModifierCommandOptionEnum,
	modifierCommandOptions,
	modifierOptionChoices,
} from './modifier.command-options.js';
import { modifierCommandDocumentation } from './modifier.documentation.js';
import { modifierStrings } from './modifier.strings.js';

export * from './modifier.command-definition.js';
export * from './modifier.documentation.js';
export * from './modifier.command-options.js';
export * from './modifier.strings.js';

export const ModifierDefinition = {
	definition: modifierCommandDefinition,
	documentation: modifierCommandDocumentation,
	options: modifierCommandOptions,
	subCommandEnum: ModifierSubCommandEnum,
	commandOptionsEnum: ModifierCommandOptionEnum,
	strings: modifierStrings,
	optionChoices: modifierOptionChoices,
} satisfies CommandReference;
