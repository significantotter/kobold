import type { CommandReference } from '../helpers/commands.types.js';
import {
	compendiumCommandDefinition,
	CompendiumSubCommandEnum,
} from './compendium.command-definition.js';
import {
	CompendiumCommandOptionEnum,
	compendiumCommandOptions,
} from './compendium.command-options.js';
import { compendiumCommandDocumentation } from './compendium.documentation.js';

export * from './compendium.command-definition.js';
export * from './compendium.documentation.js';
export * from './compendium.command-options.js';

export const CompendiumDefinition = {
	definition: compendiumCommandDefinition,
	documentation: compendiumCommandDocumentation,
	options: compendiumCommandOptions,
	subCommandEnum: CompendiumSubCommandEnum,
	commandOptionsEnum: CompendiumCommandOptionEnum,
} satisfies CommandReference;
