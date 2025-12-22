/**
 * Strings module - type-safe message templates.
 *
 * Access strings via command references:
 * @example
 * import { CounterDefinition } from '@kobold/documentation';
 *
 * CounterDefinition.strings.notFound({ counterName: 'HP' });
 * CounterDefinition.strings.shared.errors.noActiveCharacter;
 */

// Type utilities and helpers for building command strings
export { msg } from './string-types.js';
export type {
	StaticString,
	ParameterizedString,
	MessageString,
	ConfirmationStrings,
	EmbedStrings,
} from './string-types.js';

// Shared strings - include in each command's strings object
export { sharedStrings } from './shared-strings.js';
export type { SharedStrings } from './shared-strings.js';

// Utility strings - for helper modules
export { utilStrings } from './util-strings.js';
export type { UtilStrings } from './util-strings.js';
