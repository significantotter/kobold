/**
 * Interaction strings for the character command.
 */

import { msg } from '../../lib/strings/string-types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';
import { CharacterSetDefaultScopeOptionsEnum } from './character.command-options.js';

/**
 * Set default scope choices
 */
export const CharacterSetDefaultScopeChoices = {
	channel: 'channel',
	server: 'server',
} as const;

export const characterStrings = {
	/** Shared strings (choiceRegistered, errors, etc.) */
	shared: sharedStrings,

	// ─── COMMON INTERACTIONS ─────────────────────────────────────────────
	noActiveCharacter: "Yip! You don't have any active characters! Use /import to import one.",
	authenticationRequest: msg(
		(p: { action: string }) =>
			`Yip! Before you can ${p.action} a character, you need to authenticate it. ` +
			`Give me permission to read your wanderer's guide character by following the link ` +
			`below. Then, /character ${p.action} your character again!`
	),
	expiredToken:
		"Yip! It's been a while since I last authenticated your character, so our " +
		"authentication expired. Please give me permission to read your wanderer's guide " +
		'character again by following the link below',
	authenticationLink: msg(
		(p: { wgBaseUrl: string; charId: string }) =>
			`Yip! Please follow  [this link](${p.wgBaseUrl}?characterId=${p.charId}) to give me access to your character!`
	),
	tooManyWGRequests:
		"Yip! Wanderer's Guide told me I'm being pesky and sending too many requests! Try again in a moment.",

	// ─── IMPORT WANDERERS GUIDE SUBCOMMAND ───────────────────────────────
	importWanderersGuide: {
		invalidUrl: msg(
			(p: { url: string }) =>
				`Yip! I couldn't find the character at the url '${p.url}'. Check ` +
				`and make sure you copied it over correctly! Or just paste ` +
				`in the character's id value instead.`
		),
		success: msg((p: { characterName: string }) => `Yip! I've imported ${p.characterName}!`),
	},

	// ─── IMPORT PATHBUILDER SUBCOMMAND ───────────────────────────────────
	importPathbuilder: {
		invalidUrl: msg(
			(p: { id: string }) =>
				`Yip! I couldn't find any character at the json id '${p.id}'. Check ` +
				`and make sure you copied it over correctly! Or just paste ` +
				`in the character's id value instead.`
		),
		failedRequest: msg(
			(p: { supportServerUrl: string }) =>
				'Yip! I ran into an issue importing that character. Try again later, ' +
				'make sure that the json import id is correct, or contact my developer ' +
				`in my support server](${p.supportServerUrl})`
		),
		success: msg((p: { characterName: string }) => `Yip! I've imported ${p.characterName}!`),
	},

	// ─── IMPORT PASTEBIN SUBCOMMAND ──────────────────────────────────────
	importPasteBin: {
		success: msg((p: { characterName: string }) => `Yip! I've imported ${p.characterName}!`),
	},

	// ─── LIST SUBCOMMAND ─────────────────────────────────────────────────
	list: {
		noCharacters: "Yip! You don't have any characters yet! Use /import to import some!",
		characterListEmbed: {
			title: 'Characters',
			characterFieldName: msg(
				(p: {
					characterName: string;
					activeText: string;
					serverDefaultText: string;
					channelDefaultText: string;
				}) =>
					`${p.characterName}${p.activeText}${p.serverDefaultText}${p.channelDefaultText}`
			),
			characterFieldValue: msg(
				(p: {
					level: number | null;
					heritage: string | null;
					ancestry: string | null;
					classes: string | null;
				}) =>
					`Level ${p.level ?? '?'} ${p.heritage ?? ''} ${p.ancestry ?? ''} ${p.classes ?? ''}`
			),
		},
	},

	// ─── REMOVE SUBCOMMAND ───────────────────────────────────────────────
	remove: {
		confirmation: {
			text: msg(
				(p: { characterName: string }) =>
					`Are you sure you want to remove ${p.characterName}?`
			),
			removeButton: 'REMOVE',
			cancelButton: 'CANCEL',
			expired: 'Yip! Character removal request expired.',
		},
		success: msg(
			(p: { characterName: string }) =>
				`Yip! I've successfully removed ${p.characterName}! You can import them again at any time.`
		),
		cancelled: msg(
			(p: { characterName: string }) =>
				`Yip! Canceled the request to remove ${p.characterName}!`
		),
	},

	// ─── SET ACTIVE SUBCOMMAND ───────────────────────────────────────────
	setActive: {
		success: msg(
			(p: { characterName: string }) =>
				`Yip! ${p.characterName} is now your active character!`
		),
		notFound:
			"Yip! I couldn't find a character matching that name! " +
			"Check what characters you've imported using /character list",
	},

	// ─── SET DEFAULT SUBCOMMAND ──────────────────────────────────────────
	setDefault: {
		noneOption: '(None)',
		success: msg(
			(p: { characterName: string; scope: string }) =>
				`Yip! ${p.characterName} is now your default character on this ${p.scope}!`
		),
		removed: msg(
			(p: { scope: string }) =>
				`Yip! I removed your default character for this ${p.scope}. This ${p.scope} will ` +
				'now use your active character for commands again.'
		),
		notFound:
			"Yip! I couldn't find a character matching that name! " +
			"Check what characters you've imported using /character list",
	},

	// ─── UPDATE SUBCOMMAND ───────────────────────────────────────────────
	update: {
		success: msg(
			(p: { characterName: string }) => `Yip! I've successfully updated ${p.characterName}!`
		),
		canceled: msg(
			(p: { characterName: string }) =>
				`Yip! Canceled the request to update ${p.characterName}!`
		),
	},
} as const;

/**
 * Option choice values for character command
 */
export const characterOptionChoices = {
	setDefaultScope: CharacterSetDefaultScopeOptionsEnum,
	sheetStyle: sharedStrings.options.sheetStyles,
} as const;

export type CharacterStrings = typeof characterStrings;
