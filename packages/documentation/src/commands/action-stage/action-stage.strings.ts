/**
 * Interaction strings for the action-stage command.
 */

import { msg } from '../../lib/strings/string-types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';

export const actionStageStrings = {
	/** Shared strings (choiceRegistered, errors, etc.) */
	shared: sharedStrings,

	// ─── COMMON INTERACTIONS ─────────────────────────────────────────────
	notFound: "Yip! I couldn't find an action with that name.",
	rollNotFound: "Yip! I couldn't find a stage of the action with that name.",
	rollAlreadyExists: 'Yip! A roll with that name already exists for this action.',
	rollAddSuccess: msg(
		(p: { rollType: string; rollName: string; actionName: string }) =>
			`Yip! I added the ${p.rollType} roll ${p.rollName} to the action ${p.actionName}.`
	),

	// ─── ADD-TEXT SUBCOMMAND ─────────────────────────────────────────────
	addText: {
		requireText: 'Yip! You must provide at least one text input to add text to an action!',
		tooMuchText:
			'Yip! All of that text is too long to add to a single action text field! The different fields can only have' +
			' a maximum of 950 characters combined. Try splitting the text up into multiple fields!',
	},

	// ─── ADD-SAVE SUBCOMMAND ─────────────────────────────────────────────
	addSave: {
		requireText: 'Yip! You must provide at least one save result to add a save to an action!',
	},

	// ─── SET SUBCOMMAND ──────────────────────────────────────────────────
	set: {
		success: msg(
			(p: {
				actionStageOption: string;
				newValue: string;
				actionStageName: string;
				actionName: string;
			}) =>
				`Yip! ${p.actionStageOption} was set to ${p.newValue} for action stage ${p.actionStageName} in the action ${p.actionName}.`
		),
		unknownField: "Yip! That's not a field I recognize for action stages!",
		invalidField: msg(
			(p: { stageType: string }) => `Yip! That field is not valid for a ${p.stageType} stage.`
		),
	},

	// ─── REMOVE SUBCOMMAND ───────────────────────────────────────────────
	remove: {
		success: msg(
			(p: { actionStageName: string; actionName: string }) =>
				`Yip! I removed the action stage ${p.actionStageName} from the action ${p.actionName}.`
		),
	},
} as const;

export type ActionStageStrings = typeof actionStageStrings;
