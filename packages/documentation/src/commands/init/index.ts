import type { CommandReference } from '../helpers/commands.types.js';
import { initCommandDefinition, InitSubCommandEnum } from './init.command-definition.js';
import {
	InitCommandOptionEnum,
	initCommandOptions,
	initOptionChoices,
} from './init.command-options.js';
import { initCommandDocumentation } from './init.documentation.js';
import { initStrings } from './init.strings.js';

export * from './init.command-definition.js';
export * from './init.documentation.js';
export * from './init.command-options.js';
export * from './init.strings.js';

export const InitDefinition = {
	definition: initCommandDefinition,
	documentation: initCommandDocumentation,
	options: initCommandOptions,
	subCommandEnum: InitSubCommandEnum,
	commandOptionsEnum: InitCommandOptionEnum,
	strings: initStrings,
	optionChoices: initOptionChoices,
} satisfies CommandReference;
