/**
 * Interaction strings for the modifier command.
 */

import { msg } from '../../lib/strings/string-types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';

export const modifierStrings = {
	/** Shared strings (choiceRegistered, errors, etc.) */
	shared: sharedStrings,

	// ─── COMMON INTERACTIONS ─────────────────────────────────────────────
	notFound: "Yip! I couldn't find a modifier with that name.",
	detailHeader: msg(
		(p: { modifierName: string; modifierIsActive: string }) =>
			`Modifier: ${p.modifierName}${p.modifierIsActive}`
	),

	// ─── CREATE MODIFIER SUBCOMMAND ──────────────────────────────────────
	createModifier: {
		invalidTags:
			"Yip! Those target tags aren't valid! Please use a logical expression combining target " +
			'tags with "and", "or", and "not". For example, "skill and dexterity".',
		doesntEvaluateError:
			"Yip! I couldn't evaluate that roll adjustment! Make sure it's a valid dice " +
			'expression (it can also use attributes like [strength]).',
		alreadyExists: msg(
			(p: { modifierName: string; characterName: string }) =>
				`Yip! A modifier named ${p.modifierName} already exists for ${p.characterName}.`
		),
		created: msg(
			(p: { modifierName: string; characterName: string }) =>
				`Yip! I created the modifier ${p.modifierName} for ${p.characterName}.`
		),
	},

	// ─── SET SUBCOMMAND ──────────────────────────────────────────────────
	set: {
		nameExistsError: 'Yip! A modifier with that name already exists for this character!',
		invalidOptionError:
			"Yip! That's not a valid option to change! Please use one of the suggested options.",
		successEmbed: {
			title: msg(
				(p: {
					characterName: string;
					modifierName: string;
					fieldToChange: string;
					newFieldValue: string;
				}) =>
					`Yip! I set ${p.fieldToChange} to ${p.newFieldValue} for the ` +
					`modifier ${p.modifierName} on ${p.characterName}!`
			),
		},
	},

	// ─── REMOVE SUBCOMMAND ───────────────────────────────────────────────
	remove: {
		confirmation: {
			text: msg(
				(p: { modifierName: string }) =>
					`Are you sure you want to remove the modifier ${p.modifierName}?`
			),
			removeButton: 'REMOVE',
			cancelButton: 'CANCEL',
			expired: 'Yip! Modifier removal request expired.',
		},
		success: msg(
			(p: { modifierName: string }) => `Yip! I removed the modifier ${p.modifierName}.`
		),
		cancel: 'Yip! Canceled the request to remove the modifier!',
	},

	// ─── TOGGLE SUBCOMMAND ───────────────────────────────────────────────
	toggle: {
		active: 'active',
		inactive: 'inactive',
		success: msg(
			(p: { characterName: string; modifierName: string; toggledTo: string }) =>
				`Yip! ${p.characterName} had their modifier "${p.modifierName}" set to ${p.toggledTo}!`
		),
	},

	// ─── IMPORT SUBCOMMAND ───────────────────────────────────────────────
	import: {
		failedParsing:
			"Yip! I can't figure out how to read that! Try exporting another modifier to check and make " +
			"sure you're formatting it right!",
		badUrl: "Yip! I don't understand that Url! Copy the pastebin url for the pasted modifiers directly into the Url field.",
		imported: msg(
			(p: { characterName: string }) =>
				`Yip! I imported those modifiers to ${p.characterName}.`
		),
	},

	// ─── EXPORT SUBCOMMAND ───────────────────────────────────────────────
	export: {
		success: msg(
			(p: { characterName: string; pasteBinLink: string }) =>
				`Yip! I've saved ${p.characterName}'s modifiers to [this PasteBin link](${p.pasteBinLink})`
		),
	},
} as const;

export type ModifierStrings = typeof modifierStrings;
