/**
 * Interaction strings for the condition command.
 */

import { msg } from '../../lib/strings/string-types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';
import { ModifierSetOptionChoices } from '../modifier/modifier.command-options.js';

export const conditionStrings = {
	/** Shared strings (choiceRegistered, errors, etc.) */
	shared: sharedStrings,

	// ─── COMMON INTERACTIONS ─────────────────────────────────────────────
	notFound: "Yip! I couldn't find a condition with that name.",
	invalidTags:
		"Yip! Those target tags aren't valid! Please use a logical expression combining target " +
		'tags with "and", "or", and "not". For example, "skill and dexterity".',
	doesntEvaluateError:
		"Yip! I couldn't evaluate that roll adjustment! Make sure it's a valid dice " +
		'expression (it can also use attributes like [strength]).',
	alreadyExists: msg(
		(p: { conditionName: string; characterName: string }) =>
			`Yip! A condition named ${p.conditionName} already exists on ${p.characterName}.`
	),
	created: msg(
		(p: { conditionName: string; characterName: string }) =>
			`Yip! I applied the condition ${p.conditionName} to ${p.characterName}!`
	),
	cancel: 'Yip! Canceled the request to remove the condition!',
	success: msg(
		(p: { conditionName: string }) => `Yip! I removed the condition ${p.conditionName}.`
	),

	// ─── REMOVE SUBCOMMAND ───────────────────────────────────────────────
	remove: {
		confirmation: {
			text: msg(
				(p: { conditionName: string }) =>
					`Are you sure you want to remove the condition ${p.conditionName}?`
			),
			removeButton: 'REMOVE',
			cancelButton: 'CANCEL',
			expired: 'Yip! Condition removal request expired.',
		},
	},

	// ─── SET SUBCOMMAND ──────────────────────────────────────────────────
	set: {
		nameExistsError: 'Yip! A condition with that name already exists on this character!',
		invalidOptionError: "Yip! I don't know how to set that property of a condition!",
		successEmbed: {
			title: msg(
				(p: {
					characterName: string;
					conditionName: string;
					fieldToChange: string;
					newFieldValue: string;
				}) =>
					`Yip! I set ${p.fieldToChange} to ${p.newFieldValue} for the ` +
					`condition ${p.conditionName} on ${p.characterName}!`
			),
		},
	},

	// ─── SEVERITY SUBCOMMAND ─────────────────────────────────────────────
	severity: {
		removed: msg(
			(p: { conditionName: string }) =>
				`Yip! I removed the severity value from the condition "${p.conditionName}".`
		),
		updated: msg(
			(p: { conditionName: string; newSeverity: string }) =>
				`Yip! I updated the severity of the condition "${p.conditionName}" to ${p.newSeverity}.`
		),
	},
} as const;

/**
 * Option choice values for condition commands - reuses modifier choices for set option
 */
export const conditionOptionChoices = {
	setOption: ModifierSetOptionChoices,
} as const;

export type ConditionStrings = typeof conditionStrings;
