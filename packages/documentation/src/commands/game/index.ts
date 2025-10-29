import type { CommandReference } from '../helpers/commands.d.ts';
import { gameCommandDefinition, GameSubCommandEnum } from './game.command-definition.js';
import { gameCommandOptions } from './game.command-options.js';
import { gameCommandDocumentation } from './game.documentation.js';

export * from './game.command-definition.js';
export * from './game.documentation.js';
export * from './game.command-options.js';

export const GameCommand = {
	definition: gameCommandDefinition,
	documentation: gameCommandDocumentation,
	options: gameCommandOptions,
	subCommandEnum: GameSubCommandEnum,
} satisfies CommandReference;
