import type { CommandReference } from '../helpers/commands.types.js';
import { gameCommandDefinition, GameSubCommandEnum } from './game.command-definition.js';
import { GameCommandOptionEnum, gameCommandOptions } from './game.command-options.js';
import { gameCommandDocumentation } from './game.documentation.js';
import { gameStrings, gameOptionChoices } from './game.strings.js';

export * from './game.command-definition.js';
export * from './game.documentation.js';
export * from './game.command-options.js';
export * from './game.strings.js';

export const GameDefinition = {
	definition: gameCommandDefinition,
	documentation: gameCommandDocumentation,
	options: gameCommandOptions,
	subCommandEnum: GameSubCommandEnum,
	commandOptionsEnum: GameCommandOptionEnum,
	strings: gameStrings,
	optionChoices: gameOptionChoices,
} satisfies CommandReference;
