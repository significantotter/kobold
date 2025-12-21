import type { CommandReference } from '../helpers/commands.types.js';
import {
	gameplayCommandDefinition,
	GameplaySubCommandEnum,
} from './gameplay.command-definition.js';
import { GameplayCommandOptionEnum, gameplayCommandOptions } from './gameplay.command-options.js';
import { gameplayCommandDocumentation } from './gameplay.documentation.js';
import { gameplayStrings } from './gameplay.strings.js';

export * from './gameplay.command-definition.js';
export * from './gameplay.documentation.js';
export * from './gameplay.command-options.js';
export * from './gameplay.strings.js';

export const GameplayDefinition = {
	definition: gameplayCommandDefinition,
	documentation: gameplayCommandDocumentation,
	options: gameplayCommandOptions,
	subCommandEnum: GameplaySubCommandEnum,
	commandOptionsEnum: GameplayCommandOptionEnum,
	strings: gameplayStrings,
} satisfies CommandReference;
