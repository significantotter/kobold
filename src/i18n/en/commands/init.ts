export default {
	name: 'init',
	description: 'Initiative Tracking',
	interactions: {
		noActiveCharacter: "Yip! You don't have any active characters!",
	},

	// SUBCOMMANDS
	start: {
		name: 'start',
		description: 'Start initiative in the current channel.',
		expandedDescription:
			'Starts initiative in the current channel. Only one initiative can ' +
			'exist in per channel at a time. The player who creates the initiative is' +
			'marked as the GM, and can change names, add, and remove any character ' +
			'present in the initiative, not just their own.',
		interactions: {
			notServerChannelError: 'Yip! You can only start initiative in a normal server channel.',
			initExistsError:
				"Yip! There's already an initiative in this " +
				'channel. End it before you start a new one!',
			otherError: 'Yip! Something when wrong when starting your initiative!',
		},
	},
	show: {
		name: 'show',
		description: `Displays the current initiative order`,
	},
	next: {
		name: 'next',
		description: `Moves to the next participant in the initiative order`,
	},
	prev: {
		name: 'prev',
		description: `Moves to the previous participant in the initiative order`,
	},
	jumpTo: {
		name: 'jump-to',
		options: '[character]',
		usage: '_[character]_: The name of a character in the initiative order.',
		description: `Jumps to a specific participant in the initiative order`,
	},
	join: {
		name: 'join',
		options: '[*skill*] [*dice*] [*value*]',
		usage:
			'_[*skill*] optional_: The name of the skill ("perception") to use to join initiative.\n' +
			'_[*dice*] optional_: The dice expression ("1d20+5") to use to join initiative.\n' +
			'_[*value*] optional_: The static value ("15") to use to join initiative.',
		description:
			'Joins initiative with your active character. ' + 'Defaults to rolling perception.',
		expandedDescription:
			'Joins initiative with your active character. If no options are provided, ' +
			'perception is rolled for the initiative value. If multiple options are provided, only ' +
			'one will actually work. The only exception is skill + dice expression, where the ' +
			'dice expression (like "1d4") will be added onto the skill',
		interactions: {
			characterAlreadyInInit: 'Yip! {characterName} is already in this initiative!',
			joinedEmbed: {
				title: '{characterName}  joined Initiative!',
				setDescription: 'Initiative: {initValue}',
				rollDescription: 'rolled initiative!',
				roundField: {
					name: '\u200B',
					value: 'Initiative Round {currentRound}',
				},
			},
		},
	},
	add: {
		name: 'add',
		options: '[name] [*dice*] [*value*]',
		usage:
			'_[name]_: The name of the skill ("perception") to use to join initiative.\n' +
			'_[*dice*] optional_: The dice expression ("1d20+5") to use to join initiative.\n' +
			'_[*value*] optional_: The static value ("15") to use to join initiative.',
		description: `Adds an NPC or minion to initiative`,
		expandedDescription:
			'Adds a minion with the provided name to the initiative. If no options are provided, ' +
			'a flat d20 is rolled for the initiative value. If both dice and a value are provided, ' +
			'only the flat value will actually work. This character is controlled by the player ' +
			'who added it to the initiative.\n\nNote, names in initiative are unique, adding a ' +
			'duplicate name will cause a quantifier like -1 to be added to the name. e.g. Goblin-1. ' +
			'if the name Goblin already exists.',
		interactions: {
			joinedEmbed: {
				rolledTitle: '{actorName} rolled initiative!',
				joinedTitle: '{actorName} joined initiative!',
				description: 'Initiative: {finalInitiative}',
				roundField: {
					name: '\u200B',
					value: `[Initiative Round {currentRound}]({url})`,
				},
			},
		},
	},
	set: {
		name: 'set',
		options: '[name] [option] [value]',
		usage:
			'_[name]_: The name of a character in the initiative.\n' +
			'_[option]_: The property of the character to change (just for the current ' +
			'initiative!) This can be "initiative" for the initiative value, or "name" for ' +
			"the character's display name while in the initiative.\n" +
			'_[value]_: The value to set the property to.',
		description: `Sets certain properties of your character for initiative`,
		expandedDescription:
			'Sets either the initiative value or current name of the ' +
			'matching character in the initiative order. Any name changes are only reflected ' +
			"within the initiative. They don't effect the imported character elsewhere.",
		interactions: {
			invalidOptionError: 'Yip! Please send a valid option to update.',
			emptyNameError: "Yip! You can't use an empty name!",
			nameExistsError: 'Yip! A character with that name is already in the initiative.',
			initNotNumberError: 'Yip! You can only update initiative with a number.',
			successEmbed: {
				title: 'Yip! {actorName} had their {fieldToChange} set to {newFieldValue}.',
			},
		},
	},
	remove: {
		name: 'remove',
		options: '[name]',
		usage: '_[name]_: The name of a character in the initiative.',
		description: 'Removes a character from initiative.',
		expandedDescription: 'Removes the character that matches the given name from initiative',
		interactions: {
			deletedEmbed: {
				title: 'Yip! {actorName} was removed from initiative.',
			},
		},
	},
	end: {
		name: 'end',
		description: 'Ends the initiative in the current channel.',
		interactions: {
			confirmation: {
				text: 'Are you sure you want to end the initiative?',
				expired: 'Yip! The request to end the initiative expired.',
				confirmButton: 'end',
				cancelButton: 'cancel',
			},
			cancel: 'Yip! Canceled the request to end the initiative!',
			success: 'Yip! Ended the initiative!',
			error: 'Yip! Something went wrong!',
		},
	},
};
