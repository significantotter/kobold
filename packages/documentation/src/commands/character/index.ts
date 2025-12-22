import type { CommandReference } from '../helpers/commands.types.js';
import {
	characterCommandDefinition,
	CharacterSubCommandEnum,
} from './character.command-definition.js';
import {
	CharacterCommandOptionEnum,
	characterCommandOptions,
} from './character.command-options.js';
import { characterCommandDocumentation } from './character.documentation.js';
import { characterStrings, characterOptionChoices } from './character.strings.js';

export * from './character.command-definition.js';
export * from './character.documentation.js';
export * from './character.command-options.js';
export * from './character.strings.js';

export const CharacterDefinition = {
	definition: characterCommandDefinition,
	documentation: characterCommandDocumentation,
	options: characterCommandOptions,
	subCommandEnum: CharacterSubCommandEnum,
	commandOptionsEnum: CharacterCommandOptionEnum,
	strings: characterStrings,
	optionChoices: characterOptionChoices,
} satisfies CommandReference;
