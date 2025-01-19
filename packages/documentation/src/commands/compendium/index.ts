import type { CommandReference } from '../helpers/commands.d.js';
import { compendiumCommandDefinition } from './compendium.command-definition.js';
import { compendiumCommandOptions } from './compendium.command-options.js';
import { compendiumCommandDocumentation } from './compendium.documentation.js';

export * from './compendium.command-definition.js';
export * from './compendium.documentation.js';
export * from './compendium.command-options.js';

export const CompendiumCommand = {
	definition: compendiumCommandDefinition,
	documentation: compendiumCommandDocumentation,
	options: compendiumCommandOptions,
} satisfies CommandReference;
