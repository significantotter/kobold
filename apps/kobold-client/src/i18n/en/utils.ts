export default {
	dice: {
		rolledDice: 'rolled some dice!',
		rolledAction: 'rolled {actionName}',
		rollResult: '{rollExpression}\n{rollRenderedExpression}\n total = `{rollTotal}`',
		diceRollError: "Yip! I didn't understand the dice roll {rollExpression}.",
		diceRollOtherErrors: "Yip! I didn't understand the dice roll.\n{rollErrors}",
	},
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
			"Yip! I can't go to the next turn when no one is in the initiative!",
		prevTurnInitNotStartedError:
			"Yip! I can't go to the previous turn when we haven't started initiative!",
		prevTurnNotPossibleError:
			"Yip! I can't go to the previous turn when it's " +
			'the very first turn of the first round!',
	},
	koboldEmbed: {
		cantDetermineTurnError: "Yip! Something went wrong! I can't figure out whose turn it is!",
		turnTitle: "It's {groupName}'s turn!",
		roundTitle: 'Initiative Round {currentRound}',
	},
};
