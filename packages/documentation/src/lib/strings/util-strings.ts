/**
 * Utility strings used across helper modules.
 * Organized by utility category.
 */

import { msg } from './string-types.js';
import { sharedStrings } from './shared-strings.js';

export const utilStrings = {
	/** Access to shared strings */
	shared: sharedStrings,

	/** Dice utility strings */
	dice: {
		rolledDice: 'rolled some dice!',
		rolledAction: msg((p: { actionName: string }) => `rolled ${p.actionName}`),
		rollResult: msg(
			(p: { rollExpression: string; rollRenderedExpression: string; rollTotal: string }) =>
				`${p.rollExpression}\n${p.rollRenderedExpression}\n total = \`${p.rollTotal}\``
		),
		diceRollError: msg(
			(p: { rollExpression: string }) =>
				`Yip! I didn't understand the dice roll ${p.rollExpression}.`
		),
		diceRollOtherErrors: msg(
			(p: { rollErrors: string }) =>
				`Yip! I didn't understand the dice roll.\n${p.rollErrors}`
		),
	},

	/** Initiative utility strings */
	initiative: {
		characterNameNotFoundError:
			"Yip! You don't have control of any characters in the initiative matching that name!",
		activeCharacterNotInInitError: "Yip! Your active character isn't in this initiative!",
		noActiveInitError: "Yip! There's no active initiative in this channel.",
		initOutsideServerChannelError:
			'Yip! You can only send initiative commands in a regular server channel.',
		nextTurnInitEmptyError:
			"Yip! I can't go to the next turn when no one is in the initiative!",
		prevTurnInitEmptyError:
			"Yip! I can't go to the previous turn when no one is in the initiative!",
		prevTurnInitNotStartedError:
			"Yip! I can't go to the previous turn when we haven't started initiative!",
		prevTurnNotPossibleError:
			"Yip! I can't go to the previous turn when it's the very first turn of the first round!",

		/** Initiative join embed strings */
		joinedEmbed: {
			title: msg((p: { characterName: string }) => `${p.characterName} joined initiative!`),
			rollDescription: 'rolled initiative!',
			setDescription: msg((p: { initValue: number }) => `Initiative: ${p.initValue}`),
		},

		/** Initiative roll strings */
		invalidRoll: "Yip! I couldn't find that roll on your sheet.",
	},

	/** Kobold embed utility strings */
	koboldEmbed: {
		cantDetermineTurnError: "Yip! Something went wrong! I can't figure out whose turn it is!",
		turnTitle: msg((p: { groupName: string }) => `It's ${p.groupName}'s turn!`),
		roundTitle: msg((p: { currentRound: number }) => `Initiative Round ${p.currentRound}`),
	},

	/** Roll utility strings */
	roll: {
		targetNotFound: msg(
			(p: { targetName: string }) => `Yip! I couldn't find a target named "${p.targetName}"`
		),
		secretRollNotification: "Yip! I'm rolling in secret!",
		attackRollDescription: msg(
			(p: { attackName: string }) => `attacked with their ${p.attackName}!`
		),
	},

	/** Roll secret option values for comparison */
	rollSecretValues: {
		public: 'public',
		secret: 'secret',
		secretAndNotify: 'secret-and-notify',
		sendToGm: 'send-to-gm',
	},
} as const;

export type UtilStrings = typeof utilStrings;
