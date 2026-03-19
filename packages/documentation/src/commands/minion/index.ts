import type { CommandReference } from '../helpers/commands.types.js';
import { minionCommandDefinition, MinionSubCommandEnum } from './minion.command-definition.js';
import { MinionCommandOptionEnum, minionCommandOptions } from './minion.command-options.js';
import { minionCommandDocumentation } from './minion.documentation.js';

export * from './minion.command-definition.js';
export * from './minion.documentation.js';
export * from './minion.command-options.js';

export const MinionDefinition = {
	definition: minionCommandDefinition,
	documentation: minionCommandDocumentation,
	options: minionCommandOptions,
	subCommandEnum: MinionSubCommandEnum,
	commandOptionsEnum: MinionCommandOptionEnum,
} satisfies CommandReference;
