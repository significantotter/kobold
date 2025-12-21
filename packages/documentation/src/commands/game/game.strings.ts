/**
 * Interaction strings for the game command.
 */

import { msg } from '../../lib/strings/string-types.js';
import { sharedStrings } from '../../lib/strings/shared-strings.js';

/**
 * Roll secret choices
 */
export const RollSecretChoices = {
	public: 'public',
	secret: 'secret',
	secretAndNotify: 'secret-and-notify',
	sendToGm: 'send-to-gm',
} as const;

export const gameStrings = {
	/** Shared strings (choiceRegistered, errors, etc.) */
	shared: sharedStrings,

	// ─── COMMON INTERACTIONS ─────────────────────────────────────────────
	notFound: msg(
		(p: { gameName: string }) => `Yip! I couldn't find the game ${p.gameName} in this server.`
	),
	noGames: 'Yip! You have no games yet on this server.',
	activeGameNotFound:
		"Yip! I couldn't find a game that you run in this server that you've set to active!",

	// ─── LIST SUBCOMMAND ─────────────────────────────────────────────────
	list: {
		gameListEmbed: {
			title: 'Games you run in this server',
			noCharacters: 'No characters added.',
		},
	},

	// ─── CREATE SUBCOMMAND ───────────────────────────────────────────────
	create: {
		gameAlreadyExists: 'Yip! A game with that name already exists in this server.',
		gameNameTooShort: "Yip! Your game's name needs to be at least 2 characters!",
		success: msg(
			(p: { gameName: string }) => `Yip! I created the game "${p.gameName}" in this server.`
		),
	},

	// ─── SET-ACTIVE SUBCOMMAND ───────────────────────────────────────────
	setActive: {
		success: msg(
			(p: { gameName: string }) =>
				`Yip! I set the game "${p.gameName}" as your active game in this server.`
		),
	},

	// ─── DELETE SUBCOMMAND ───────────────────────────────────────────────
	delete: {
		success: msg(
			(p: { gameName: string }) => `Yip! I deleted the game "${p.gameName}" in this server.`
		),
	},

	// ─── KICK SUBCOMMAND ─────────────────────────────────────────────────
	kick: {
		success: msg(
			(p: { characterName: string; gameName: string }) =>
				`Yip! I kicked ${p.characterName} out of the game "${p.gameName}"!`
		),
		characterNotInGame: msg(
			(p: { characterName: string; gameName: string }) =>
				`Yip! I couldn't find the character ${p.characterName} in the game "${p.gameName}"!`
		),
	},

	// ─── JOIN SUBCOMMAND ─────────────────────────────────────────────────
	join: {
		success: msg(
			(p: { characterName: string; gameName: string }) =>
				`Yip! ${p.characterName} joined the game "${p.gameName}"!`
		),
		alreadyInGame: msg(
			(p: { characterName: string; gameName: string }) =>
				`${p.characterName} is already in ${p.gameName}!`
		),
	},

	// ─── LEAVE SUBCOMMAND ────────────────────────────────────────────────
	leave: {
		success: msg(
			(p: { characterName: string; gameName: string }) =>
				`Yip! ${p.characterName} left the game "${p.gameName}"!`
		),
		notInGame: msg(
			(p: { characterName: string; gameName: string }) =>
				`Yip! ${p.characterName} isn't in the game "${p.gameName}"!`
		),
	},

	// ─── INIT SUBCOMMAND ─────────────────────────────────────────────────
	init: {
		alreadyInInit: 'Yip! All the characters in your game were already in the initiative!',
	},

	// ─── ROLL SUBCOMMAND ─────────────────────────────────────────────────
	roll: {
		rolledDice: 'rolled dice',
	},
} as const;

/**
 * Option choice values for game command
 */
export const gameOptionChoices = {
	rollSecret: RollSecretChoices,
} as const;

export type GameStrings = typeof gameStrings;
