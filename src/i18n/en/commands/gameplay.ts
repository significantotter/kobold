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
	damage: {
		name: 'damage',
		description:
			'Applies damage to a character, effecting tempHp, stamina (if enabled), and hp.',
		options: '[target-character] [amount] [*type*]',
		usage:
			'[target-character]: The target character that you control or is in the initiative. ' +
			'[amount]: The amount of damage dealt. Use a negative number to heal.\n' +
			"[type]: The damage type. If specified, the target's weaknesses/resistances/immunities will be checked \n",
		expandedDescription:
			'Damages a  character/npc. Or, if given a negative number, heals them instead.\n',
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
	tracker: {
		name: 'tracker',
		options: '[*target-character*] [*target-channel*]',
		usage:
			'_[*target-character*] optional_: The target character that you control. Defaults to your active character.' +
			'_[*target-channel*] optional_: The target channel that you have access to. Defaults to the current channel.',
		description:
			'Sets up a tracker to follow the changing statistics of one of your characters.',
		expandedDescription:
			'Sets up a tracker to follow the changing statistics of one of your characters. Only one is allowed per character.',
	},
};
