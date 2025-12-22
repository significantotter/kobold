/**
 * Counter command interaction strings.
 *
 * These strings are used for user-facing messages in the counter command.
 * Flat structure for easy access: `CounterCommand.strings.notFound({ counterName })`
 */

import {
	msg,
	type ConfirmationStrings,
	type EmbedStrings,
} from '../../lib/strings/string-types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';

/**
 * Counter command strings - flat structure for easy access.
 *
 * @example
 * counterStrings.notFound({ counterName: 'HP' });
 * counterStrings.reset({ counterName: 'HP', characterName: 'Otter' });
 */
export const counterStrings = {
	// =========================================================================
	// General / Validation errors
	// =========================================================================

	notFound: msg(
		(p: { counterName: string }) => `Yip! I couldn't find a counter named ${p.counterName}.`
	),

	invalidStyle: msg(
		(p: { style: string }) =>
			`Yip! The counter style ${p.style} must be one of "prepared", "dots", or "default"!`
	),

	invalidForStyle: msg(
		(p: { parameter: string; style: string }) =>
			`Yip! The ${p.parameter} option is invalid for a ${p.style} counter!`
	),

	maxTooLarge: 'Yip! The counter max value must be less than 20!',

	maxTooSmall: 'Yip! The counter max value must be a positive value, or -1 for no max.',

	recoverToInvalid:
		'Yip! The recover to value must be a positive value, or -1 for the max value.',

	notNumeric: msg(
		(p: { counterName: string }) =>
			`Yip! ${p.counterName} is not a numeric counter. I can only adjust the value of a numeric (dots or default) counter. Use the \`/counter use-slot\` command to change the value of a prepared counter.`
	),

	notPrepared: msg(
		(p: { counterName: string }) =>
			`Yip! ${p.counterName} is not a prepared counter. I can only mark a slot as used from a prepared slots counter. Use the \`/counter value\` command to change the value of a numeric counter.`
	),

	// =========================================================================
	// Reset subcommand
	// =========================================================================

	reset: msg(
		(p: { counterName: string; characterName: string }) =>
			`Yip! I reset ${p.characterName}'s counter ${p.counterName}.`
	),

	// =========================================================================
	// Use-slot subcommand
	// =========================================================================

	usedSlot: msg(
		(p: {
			characterName: string;
			usedOrReset: string;
			slotName: string;
			counterName: string;
		}) => `Yip! ${p.characterName} ${p.usedOrReset} ${p.slotName} from ${p.counterName}.`
	),

	// =========================================================================
	// Value subcommand
	// =========================================================================

	adjustValue: msg(
		(p: {
			changeType: string;
			changeValue: string | number;
			toFrom: string;
			counterName: string;
			maxMin: string;
			newValue: string | number;
		}) =>
			`Yip! I ${p.changeType} ${p.changeValue} ${p.toFrom} "${p.counterName}" resulting in ${p.maxMin} ${p.newValue}.`
	),

	setValue: msg(
		(p: { counterName: string; maxMin: string; newValue: string | number }) =>
			`Yip! I set the value of "${p.counterName}" to ${p.maxMin} ${p.newValue}.`
	),

	// =========================================================================
	// Prepare subcommand
	// =========================================================================

	prepared: msg(
		(p: { slotName: string; characterName: string; counterName: string }) =>
			`Yip! I prepared ${p.slotName} on ${p.characterName}'s counter "${p.counterName}".`
	),

	preparedMany: msg(
		(p: { slotNames: string; characterName: string; counterName: string }) =>
			`Yip! I prepared ${p.slotNames} on ${p.characterName}'s counter "${p.counterName}".`
	),

	// =========================================================================
	// Create subcommand
	// =========================================================================

	created: msg(
		(p: { counterName: string; characterName: string }) =>
			`Yip! I created the counter ${p.counterName} for ${p.characterName}.`
	),

	alreadyExists: msg(
		(p: { counterName: string; characterName: string }) =>
			`Yip! A counter named ${p.counterName} already exists for ${p.characterName}.`
	),

	// =========================================================================
	// Set subcommand
	// =========================================================================

	setInvalidOption: 'Yip! Please choose a valid option to set.',

	setStringTooLong: msg(
		(p: { propertyName: string; numCharacters: number }) =>
			`Yip! ${p.propertyName} can't be longer than ${p.numCharacters} characters!`
	),

	setNameExists: 'Yip! A counter with that name already exists.',

	setSuccess: {
		title: msg(
			(p: { propertyName: string; groupName: string; newPropertyValue: string }) =>
				`Yip! I set ${p.propertyName} on ${p.groupName} to ${p.newPropertyValue}.`
		),
	} satisfies EmbedStrings<{ propertyName: string; groupName: string; newPropertyValue: string }>,

	setInvalidGroup: msg(
		(p: { groupName: string }) => `Yip! I could not find a counter group named ${p.groupName}.`
	),

	groupNotFound: msg(
		(p: { groupName: string }) => `Yip! I could not find a counter group named ${p.groupName}.`
	),

	setRecoverToInvalid:
		'Yip! The recover to value must be less than the max value. Or -1 for the max value, or -2 for half the max value.',

	// =========================================================================
	// Remove subcommand
	// =========================================================================

	removeConfirmation: {
		text: msg(
			(p: { counterName: string }) =>
				`Are you sure you want to remove the counter ${p.counterName}?`
		),
		confirmButton: 'REMOVE',
		cancelButton: 'CANCEL',
		expired: 'Yip! Counter removal request expired.',
	} satisfies ConfirmationStrings<{ counterName: string }>,

	removeCanceled: 'Yip! Canceled the request to remove the counter!',

	removed: msg((p: { counterName: string }) => `Yip! I removed the counter ${p.counterName}.`),

	// =========================================================================
	// Shared strings (available on all commands)
	// =========================================================================

	/** Shared strings used across multiple commands */
	shared: sharedStrings,
} as const;

export type CounterStrings = typeof counterStrings;
