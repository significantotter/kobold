import type { CommandReference } from '../helpers/commands.d.js';
import { rollMacroCommandDefinition } from './roll-macro.command-definition.js';
import { rollMacroCommandOptions } from './roll-macro.command-options.js';
import { rollMacroCommandDocumentation } from './roll-macro.documentation.js';

export * from './roll-macro.command-definition.js';
export * from './roll-macro.documentation.js';
export * from './roll-macro.command-options.js';

export const RollMacroCommand = {
	definition: rollMacroCommandDefinition,
	documentation: rollMacroCommandDocumentation,
	options: rollMacroCommandOptions,
} satisfies CommandReference;
