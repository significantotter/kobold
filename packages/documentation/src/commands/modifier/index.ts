import type { CommandReference } from '../helpers/commands.d.ts';
import {
	modifierCommandDefinition,
	ModifierSubCommandEnum,
} from './modifier.command-definition.js';
import { modifierCommandOptions } from './modifier.command-options.js';
import { modifierCommandDocumentation } from './modifier.documentation.js';

export * from './modifier.command-definition.js';
export * from './modifier.documentation.js';
export * from './modifier.command-options.js';

export const ModifierCommand = {
	definition: modifierCommandDefinition,
	documentation: modifierCommandDocumentation,
	options: modifierCommandOptions,
	subCommandEnum: ModifierSubCommandEnum,
} satisfies CommandReference;
