import type { CommandReference } from '../helpers/commands.d.ts';
import {
	gameplayCommandDefinition,
	GameplaySubCommandEnum,
} from './gameplay.command-definition.js';
import { gameplayCommandOptions } from './gameplay.command-options.js';
import { gameplayCommandDocumentation } from './gameplay.documentation.js';

export * from './gameplay.command-definition.js';
export * from './gameplay.documentation.js';
export * from './gameplay.command-options.js';

export const GameplayCommand = {
	definition: gameplayCommandDefinition,
	documentation: gameplayCommandDocumentation,
	options: gameplayCommandOptions,
	subCommandEnum: GameplaySubCommandEnum,
} satisfies CommandReference;
