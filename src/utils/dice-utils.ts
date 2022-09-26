import { Dice } from 'dice-typescript';

export function rollDiceReturningMessage(diceExpression, { prefixText = '', rollNote = '' }) {
	try {
		const roll = new Dice(null, null, {
			maxRollTimes: 20, // limit to 20 rolls
			maxDiceSides: 100, // limit to 100 dice faces
		}).roll(diceExpression);
		if (roll.errors?.length) {
			return `Yip! We didn't understand the dice roll.\n` + roll.errors.join('\n');
		}
		let response = `${diceExpression}\n${roll.renderedExpression.toString()} = ${roll.total}`;
		if (rollNote) response += `\n${rollNote}`;
		if (prefixText) response = `${prefixText}${response}`;

		//send a message about the total
		return response;
	} catch (err) {
		return `Yip! We didn't understand the dice roll "${diceExpression}".`;
	}
}
