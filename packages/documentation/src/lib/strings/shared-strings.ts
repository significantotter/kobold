/**
 * Shared interaction strings used across multiple commands.
 */

import { msg } from './string-types.js';

export const sharedStrings = {
	/** Generic choice confirmation */
	choiceRegistered: msg((p: { choice: string }) => `You chose ${p.choice}.`),

	options: {
		// Warning: The DB schema and enum helpers depend on the values of this object! Do not change them without updating those as well.
		sheetStyles: {
			countersOnly: 'counters_only',
			basicStats: 'basic_stats',
			fullSheet: 'full_sheet',
		},
	},
	/** Common error messages */
	errors: {
		noActiveCharacter: 'Yip! You need to set an active character first.',
		notFound: msg((p: { name: string }) => `Yip! I couldn't find ${p.name}.`),
		invalidOption: 'Yip! Please choose a valid option.',
		stringTooLong: msg(
			(p: { propertyName: string; numCharacters: number }) =>
				`Yip! ${p.propertyName} can't be longer than ${p.numCharacters} characters!`
		),
		nameExists: msg((p: { type: string }) => `Yip! A ${p.type} with that name already exists.`),
	},

	/** Common confirmation dialog strings */
	confirmations: {
		removeButton: 'REMOVE',
		cancelButton: 'CANCEL',
		confirmButton: 'CONFIRM',
		expired: msg((p: { action: string }) => `Yip! ${p.action} request expired.`),
		canceled: msg((p: { action: string }) => `Yip! Canceled the request to ${p.action}!`),
	},

	/** Common success messages */
	success: {
		created: msg(
			(p: { type: string; name: string; characterName: string }) =>
				`Yip! I created the ${p.type} ${p.name} for ${p.characterName}.`
		),
		removed: msg(
			(p: { type: string; name: string }) => `Yip! I removed the ${p.type} ${p.name}.`
		),
		updated: msg(
			(p: { propertyName: string; targetName: string; newValue: string }) =>
				`Yip! I set ${p.propertyName} on ${p.targetName} to ${p.newValue}.`
		),
	},
} as const;

export type SharedStrings = typeof sharedStrings;
