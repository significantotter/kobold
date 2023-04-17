export default {
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
	action: {
		name: 'action',
		options: '[action] [*action_modifier*] [*damage_modifier*] [*note*] [*secret*]',
		description: `rolls an action for your active character`,
		interactions: {
			rollEmbed: {
				rollDescription: 'used {actionName}!',
			},
		},
	},
};
