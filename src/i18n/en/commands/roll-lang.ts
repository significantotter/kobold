export const RollCommandLang = {
	name: 'roll',
	description: 'Roll Dice',
	interactions: {
		noActiveCharacter: "Yip! You don't have any active characters!",
		secretRollNotification: "Yip! I'm rolling in secret!",
		rolledDice: 'rolled {diceType}',
	},

	dice: {
		name: 'dice',
		options: '[dice] [*note*] [*secret*]',
		usage:
			'**[dice]**: The dice expression to roll ("1d20 - 1d4 + 3). Uses a ' +
			'similar syntax to Roll20.\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.',
		description: `Rolls some dice.`,
		interactions: {
			rolledDice: 'rolled some dice!',
		},
	},
	skill: {
		name: 'skill',
		options: '[skill] [*dice*] [*note*] [*secret*]',
		usage:
			'**[skill]**: The name of the skill to roll.\n' +
			'**[*dice*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the skill roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.',
		description: `rolls a skill for your active character`,
	},
	perception: {
		name: 'perception',
		options: '[*dice*] [*note*] [*secret*]',
		usage:
			'**[*dice*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the perception roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.',
		description: `rolls perception for your active character`,
	},
	save: {
		name: 'save',
		options: '[save] [*dice*] [*note*] [*secret*]',
		usage:
			'**[save]**: The name of the saving throw to roll.\n' +
			'**[*dice*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the save roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.',
		description: `rolls a saving throw for your active character`,
	},
	ability: {
		name: 'ability',
		options: '[ability] [*dice*] [*note*] [*secret*]',
		usage:
			'**[ability]**: The name of the ability to roll.\n' +
			'**[*dice*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the ability roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.',
		description: `rolls an ability for your active character`,
	},
	attack: {
		name: 'attack',
		options: '[attack] [*attack_modifier*] [*damage_modifier*] [*note*] [*secret*]',
		usage:
			'**[attack]**: The name of the attack to roll.\n' +
			'**[*attack\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the attack roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*damage\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the damage roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.',
		description: `rolls an attack for your active character`,
		interactions: {
			rollEmbed: {
				rollDescription: 'attacked with their {attackName}!',
				toHit: 'To Hit',
				damage: 'Damage',
			},
		},
	},
};

export const RollCommandOptionsLang = {
	saveChoice: {
		name: 'save',
		description: 'The save to roll.',
	},
	skillChoice: {
		name: 'skill',
		description: 'The skill to roll.',
		overwrites: {
			initJoinDescription: 'The skill to use for initiative instead of perception.',
		},
	},
	abilityChoice: {
		name: 'ability',
		description: 'The ability to roll.',
	},
	attackChoice: {
		name: 'attack',
		description: 'The attack to roll.',
	},
	rollExpression: {
		name: 'dice',
		description: 'The dice expression to roll. Similar to Roll20 dice rolls.',
		overwrites: {
			initAddDescription: 'Dice to roll to join initiative.',
			initJoinDescription:
				'Dice to roll to join initiative. ' + 'Modifies your skill if you chose a skill.',
		},
	},
	rollSecret: {
		name: 'secret',
		description: 'Whether to send the roll in a hidden, temporary message.',
		choices: {
			public: {
				name: 'public',
				value: 'public',
				description: 'A public roll.',
			},
			secret: {
				name: 'secret',
				value: 'secret',
				description: 'A temporary, hidden roll viewable only to you.',
			},
			secretAndNotify: {
				name: 'secret-and-notify',
				value: 'secret-and-notify',
				description: 'A secret roll that still notifies the channel that a roll was made.',
			},
		},
	},
	rollModifier: {
		name: 'modifier',
		description: 'A dice expression to modify your roll. (e.g. "+ 1 + 1d4")',
	},
	attackRollModifier: {
		name: 'attack_modifier',
		description: 'A dice expression to modify your attack roll. (e.g. "+ 1 + 1d4")',
	},
	damageRollModifier: {
		name: 'damage_modifier',
		description: 'A dice expression to modify your damage roll. (e.g. "+ 1 + 1d4")',
	},
	rollNote: {
		name: 'note',
		description: 'A note about the reason for the roll.',
	},
};
