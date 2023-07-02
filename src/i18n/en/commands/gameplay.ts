export default {
	name: 'gameplay',
	description: 'Commands for interacting with the gameplay stats of a character or npc.',
	interactions: {},
	set: {
		name: 'set',
		description: "Sets a character's gameplay stat (such as hp) to a value",
		options: '[option] [value] [*target-character*]',
		usage:
			'[option]: The property of the character to change (on their sheet and for the current ' +
			'initiative!).\n' +
			'[value]: The value to set the property to. Can be a number that\'s 0 or higher. Put "+" or' +
			'"-" next to the number in order to increment or decrement by that value instead. If the hp ' +
			'is currently 3, then a value of 5 will set the hp to 5. If the hp is 3, then a value of +5 ' +
			'will set the hp to 8 instead\n' +
			'_[*target-character*] optional_: The target character that you control or is in the initiative. ' +
			'Defaults to your active character.',
		expandedDescription:
			'Updates a gameplay stat like hp for a character/npc.\n' +
			'Sets the stat specified in the options to the value for the target character.\n' +
			'Possible options are hp, tempHp, stamina, resolve, heroPoints, and focusPoints\n',
		interactions: {
			optionExceedsMax: 'Yip! The value you entered exceeds the maximum value for this stat.',
			optionUnderZero: 'Yip! The value you entered is less than zero.',
			optionNotANumber: 'Yip! The value you entered is not a number.',
		},
	},
	recover: {
		name: 'recover',
		options: '[*target-character*]',
		usage:
			'_[*target-character*] optional_: The target character that you control or is in the initiative. ' +
			'Defaults to your active character.',
		description:
			'Resets all of a character/npc\'s "recoverable" stats (hp, stamina, resolve) to their maximum values.',
		expandedDescription: 'Recovers hp, stamina, and resolve for the target-character.\n',
	},
};
