import type { CommandReference } from '../helpers/commands.types.js';
import {
	rollMacroCommandDefinition,
	rollMacroSubCommandEnum,
} from './roll-macro.command-definition.js';
import {
	RollMacroCommandOptionEnum,
	rollMacroCommandOptions,
} from './roll-macro.command-options.js';
import { rollMacroCommandDocumentation } from './roll-macro.documentation.js';
import { rollMacroStrings } from './roll-macro.strings.js';

export * from './roll-macro.command-definition.js';
export * from './roll-macro.documentation.js';
export * from './roll-macro.command-options.js';
export * from './roll-macro.strings.js';

export const RollMacroDefinition = {
	definition: rollMacroCommandDefinition,
	documentation: rollMacroCommandDocumentation,
	options: rollMacroCommandOptions,
	subCommandEnum: rollMacroSubCommandEnum,
	commandOptionsEnum: RollMacroCommandOptionEnum,
	strings: rollMacroStrings,
} satisfies CommandReference;
