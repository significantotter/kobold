/**
 * Counter Group command interaction strings.
 *
 * These strings are used for user-facing messages in the counter-group command.
 * Flat structure for easy access: `CounterGroupCommand.strings.notFound({ groupName })`
 */

import {
	msg,
	type ConfirmationStrings,
	type EmbedStrings,
} from '../../lib/strings/string-types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';

/**
 * Counter Group command strings - flat structure for easy access.
 *
 * @example
 * counterGroupStrings.notFound({ groupName: 'Spells' });
 * counterGroupStrings.reset({ groupName: 'Spells', characterName: 'Otter' });
 */
export const counterGroupStrings = {
	// =========================================================================
	// General / Validation errors
	// =========================================================================

	notFound: msg(
		(p: { groupName: string }) => `Yip! I couldn't find a counter group named ${p.groupName}.`
	),

	// =========================================================================
	// Reset subcommand
	// =========================================================================

	reset: msg(
		(p: { characterName: string; groupName: string }) =>
			`Yip! I reset all the counters in ${p.characterName}'s counter group ${p.groupName}.`
	),

	// =========================================================================
	// Create subcommand
	// =========================================================================

	created: msg(
		(p: { groupName: string; characterName: string }) =>
			`Yip! I created the counter group ${p.groupName} for ${p.characterName}.`
	),

	alreadyExists: msg(
		(p: { groupName: string; characterName: string }) =>
			`Yip! A counter group named ${p.groupName} already exists for ${p.characterName}.`
	),

	// =========================================================================
	// Set subcommand
	// =========================================================================

	setInvalidOption: 'Yip! Please choose a valid option to set.',

	setStringTooLong: msg(
		(p: { propertyName: string; numCharacters: number }) =>
			`Yip! ${p.propertyName} can't be longer than ${p.numCharacters} characters!`
	),

	setNameExists: 'Yip! A counter group with that name already exists.',

	setSuccess: {
		title: msg(
			(p: { propertyName: string; groupName: string; newPropertyValue: string }) =>
				`Yip! I set ${p.propertyName} on ${p.groupName} to ${p.newPropertyValue}.`
		),
	} satisfies EmbedStrings<{ propertyName: string; groupName: string; newPropertyValue: string }>,

	// =========================================================================
	// Remove subcommand
	// =========================================================================

	removeConfirmation: {
		text: msg(
			(p: { groupName: string }) =>
				`Are you sure you want to remove the counter group ${p.groupName}?`
		),
		confirmButton: 'REMOVE',
		cancelButton: 'CANCEL',
		expired: 'Yip! Counter group removal request expired.',
	} satisfies ConfirmationStrings<{ groupName: string }>,

	removeCanceled: 'Yip! Canceled the request to remove the counter group!',

	removed: msg((p: { groupName: string }) => `Yip! I removed the counter group ${p.groupName}.`),

	// =========================================================================
	// Shared strings (available on all commands)
	// =========================================================================

	/** Shared strings used across multiple commands */
	shared: sharedStrings,
} as const;

export type CounterGroupStrings = typeof counterGroupStrings;
