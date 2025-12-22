/**
 * Interaction strings for the action command.
 */

import { msg } from '../../lib/strings/string-types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';

export const actionStrings = {
	/** Shared strings (choiceRegistered, errors, etc.) */
	shared: sharedStrings,

	// ─── COMMON INTERACTIONS ─────────────────────────────────────────────
	notFound: "Yip! I couldn't find an action with that name.",

	// ─── CREATE SUBCOMMAND ───────────────────────────────────────────────
	create: {
		created: msg(
			(p: { actionName: string; characterName: string }) =>
				`Yip! I created the action ${p.actionName} for ${p.characterName}.`
		),
		alreadyExists: msg(
			(p: { actionName: string; characterName: string }) =>
				`Yip! An action named ${p.actionName} already exists for ${p.characterName}.`
		),
	},

	// ─── REMOVE SUBCOMMAND ───────────────────────────────────────────────
	remove: {
		confirmation: {
			text: msg(
				(p: { actionName: string }) =>
					`Are you sure you want to remove the action ${p.actionName}?`
			),
			removeButton: 'REMOVE',
			cancelButton: 'CANCEL',
			expired: 'Yip! Action removal request expired.',
		},
		cancel: 'Yip! Canceled the request to remove the action!',
		success: msg((p: { actionName: string }) => `Yip! I removed the action ${p.actionName}.`),
	},

	// ─── SET SUBCOMMAND ──────────────────────────────────────────────────
	set: {
		success: msg(
			(p: { actionOption: string; newValue: string; actionName: string }) =>
				`Yip! ${p.actionOption} was set to ${p.newValue} for the action ${p.actionName}.`
		),
		invalidActionType: 'Yip! The valid action types are "spell", "attack", and "other".',
		invalidActionCost:
			'Yip! Valid action costs are "one", "two", "three", "free", "variable", and "reaction".',
		invalidInteger: 'Yip! This field must be a positive, whole number.',
		unknownField: "Yip! That's not a field I recognize for an action!",
	},

	// ─── IMPORT SUBCOMMAND ───────────────────────────────────────────────
	import: {
		failedParsing:
			"Yip! I can't figure out how to read that! Try exporting another action to check and make " +
			"sure you're formatting it right!",
		badUrl: "Yip! I don't understand that Url! Copy the pastebin url for the pasted actions directly into the Url field.",
		imported: msg(
			(p: { characterName: string }) => `Yip! I imported those actions to ${p.characterName}.`
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

export type ActionStrings = typeof actionStrings;
