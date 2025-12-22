/**
 * Interaction strings for the init command.
 */

import { msg } from '../../lib/strings/string-types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';

export const initStrings = {
	/** Shared strings (choiceRegistered, errors, etc.) */
	shared: sharedStrings,

	// ─── START SUBCOMMAND ────────────────────────────────────────────────
	start: {
		notServerChannelError: 'Yip! You can only start initiative in a normal server channel.',
		initExistsError:
			"Yip! There's already an initiative in this channel. End it before you start a new one!",
		otherError: 'Yip! Something went wrong when starting your initiative!',
	},

	// ─── JOIN SUBCOMMAND ─────────────────────────────────────────────────
	join: {
		characterAlreadyInInit: msg(
			(p: { characterName: string }) =>
				`Yip! ${p.characterName} is already in this initiative!`
		),
		joinedEmbed: {
			title: msg((p: { characterName: string }) => `${p.characterName} joined Initiative!`),
			setDescription: msg(
				(p: { initValue: number | string }) => `Initiative: ${p.initValue}`
			),
			rollDescription: 'rolled initiative!',
		},
	},

	// ─── ADD SUBCOMMAND ──────────────────────────────────────────────────
	add: {
		joinedEmbed: {
			rolledTitle: msg((p: { actorName: string }) => `${p.actorName} rolled initiative!`),
			joinedTitle: msg((p: { actorName: string }) => `${p.actorName} joined initiative!`),
			description: msg(
				(p: { finalInitiative: number | string }) => `Initiative: ${p.finalInitiative}`
			),
		},
	},

	// ─── SET SUBCOMMAND ──────────────────────────────────────────────────
	set: {
		invalidOptionError: 'Yip! Please send a valid option to update.',
		emptyNameError: "Yip! You can't use an empty name!",
		nameExistsError: 'Yip! A character with that name is already in the initiative.',
		initNotNumberError: 'Yip! You can only update initiative with a number.',
		successEmbed: {
			title: msg(
				(p: { actorName: string; fieldToChange: string; newFieldValue: string }) =>
					`Yip! ${p.actorName} had their ${p.fieldToChange} set to ${p.newFieldValue}.`
			),
		},
	},

	// ─── REMOVE SUBCOMMAND ───────────────────────────────────────────────
	remove: {
		deletedEmbed: {
			title: msg(
				(p: { actorName: string }) => `Yip! ${p.actorName} was removed from initiative.`
			),
		},
	},

	// ─── END SUBCOMMAND ──────────────────────────────────────────────────
	end: {
		confirmation: {
			text: 'Are you sure you want to end the initiative?',
			expired: 'Yip! The request to end the initiative expired.',
			confirmButton: 'end',
			cancelButton: 'cancel',
		},
		cancel: 'Yip! Canceled the request to end the initiative!',
		success: 'Yip! Ended the initiative!',
		error: 'Yip! Something went wrong!',
	},

	// ─── ROLL SUBCOMMAND ─────────────────────────────────────────────────
	roll: {
		invalidRoll: "Yip! I couldn't find that roll on your sheet.",
	},
} as const;

export type InitStrings = typeof initStrings;
