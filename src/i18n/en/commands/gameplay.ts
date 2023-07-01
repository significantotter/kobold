export default {
	name: 'gameplay',
	description: 'Commands for interacting with the gameplay stats of a character or npc.',
	interactions: {},
	set: {
		name: 'set',
		description: "Sets a character's gameplay stat (such as hp) to a value",
		expandedDescription:
			'Updates a gameplay stat like hp for a character/npc.\n' +
			'`/game manage [option] [value] [target-character]`\n' +
			'Sets the stat specified in the options to the value for the target character.\n' +
			'Possible options: hp, tempHp, stamina, resolve, heroPoints, focusPoints\n',
		interactions: {
			optionExceedsMax: 'Yip! The value you entered exceeds the maximum value for this stat.',
			optionUnderZero: 'Yip! The value you entered is less than zero.',
			optionNotANumber: 'Yip! The value you entered is not a number.',
		},
	},
	recover: {
		name: 'recover',
		description:
			'Resets all of a character/npc\'s "recoverable" stats (hp, stamina, resolve) to their maximum values.',
	},
};
