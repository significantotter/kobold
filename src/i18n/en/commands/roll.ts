export default {
	name: 'roll',
	description: 'Roll Dice',
	interactions: {
		noActiveCharacter: "Yip! You don't have any active characters!",
		secretRollNotification: "Yip! I'm rolling in secret!",
		rolledDice: 'rolled {diceType}',
		damageTaken: '{creatureName} took {damage} damage!',
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
		options:
			'[attack] [target-character] [*attack_modifier*] [*damage_modifier*] [*note*] [*secret*] [*overwrite-ac*]',
		usage:
			'**[attack]**: The name of the attack to roll.\n' +
			'**[target-character]**: The target character. Select (None) for no target.\n' +
			'**[*attack\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the attack roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*damage\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the damage roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.\n' +
			'**[*overwrite-ac*] optional**: Overwrite the AC of the attack.',
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
		options:
			'[action] [target-character] [*action_modifier*] [*damage_modifier*] [*note*] [*secret*] [*overwrite-dc*] [*overwrite-save-dice-roll*]',
		usage:
			'**[action]**: The name of the action to roll.\n' +
			'**[target-character]**: The target character. Select (None) for no target.\n' +
			'**[*attack\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the attack roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*damage\\_modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
			'the end of the damage roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*note*] optional**: A note to add to the end of the dice roll.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.' +
			'**[*overwrite-dc*] optional**: Overwrite the DC of the action. Only works if the action has a DC.\n' +
			'**[*overwrite-save-dice-roll*] optional**: Overwrite the dice roll of the save. Only works if the action has a save.',
		description: `rolls an action for your active character`,
		interactions: {
			rollEmbed: {
				rollDescription: 'used {actionName}!',
			},
		},
	},
};
