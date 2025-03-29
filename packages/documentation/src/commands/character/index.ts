import type { CommandReference } from '../helpers/commands.d.js';
import { characterCommandDefinition } from './character.command-definition.js';
import { characterCommandOptions } from './character.command-options.js';
import { characterCommandDocumentation } from './character.documentation.js';

export * from './character.command-definition.js';
export * from './character.documentation.js';
export * from './character.command-options.js';

export const CharacterCommand = {
	definition: characterCommandDefinition,
	documentation: characterCommandDocumentation,
	options: characterCommandOptions,
} satisfies CommandReference;
