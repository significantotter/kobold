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
	statBlock: {
		name: 'stat-block',
		options: '[character]',
		usage: '_[character]_: The name of a character in the initiative order.',
		description: `Displays the statBlock for a creature in the initiative order`,
	},
	roll: {
		name: 'roll',
		description: `Rolls dice for an initiative member that you control`,
		options: '[character] [roll] [target-character] [*dice-roll-or-modifier*] [*secret*]',
		usage:
			'**[*character]** optional**: Which character in initiative to roll for.\n' +
			'**[roll]**: The name of the ability to roll.\n' +
			'**[target-character]**: The target character. Select (None) for no target.\n' +
			'**[*modifier*] optional**: A dice expression to modify a roll ("1d20 - 1d4 + 3"). The attack roll/save if ' +
			'the roll is an attack or action.\n' +
			'**[*damage_modifier*] optional**: A dice expression to modify a damage roll if the roll is ' +
			'an attack or action ("1d20 - 1d4 + 3").\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.\n' +
			'**[*overwrite-ac*] optional**: Overwrite the AC of the attack.',
		interactions: {
			noSheet:
				"Yip! That character doesn't have any creature/character data associated with it. " +
				"It's either a custom npc or wasn't imported properly",
			invalidRoll: "Yip! I couldn't find that roll on your sheet.",
		},
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
	note: {
		name: 'note',
		options: '[name]',
		usage:
			'_[name]_: The name of a character in the initiative.\n' +
			'_[note]_: The note to add to the character.\n' +
			'To remove a note, use any of: "-", "none", "clear", "remove", "x", or "."\n',
		description: `Sets a note for a character in the initiative.`,
		expandedDescription:
			`Sets a note for a character in the initiative.\n` +
			'To split a note over multiple lines, use "\\n" or "|" between the lines.',
	},
	join: {
		name: 'join',
		options: '[*skill*] [*dice*] [*value*] [*hide-stats*]',
		usage:
			'_[*skill*] optional_: The name of the skill ("perception") to use to join initiative.\n' +
			'_[*dice*] optional_: The dice expression ("1d20+5") to use to join initiative.\n' +
			'_[*value*] optional_: The static value ("15") to use to join initiative.' +
			"_[*hide-stats*] optional_: Whether to hide the creature's stats. Defaults to not hiding.",
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
			},
		},
	},
	add: {
		name: 'add',
		options: '[creature] [name] [*dice*] [*value*] [*hide-stats*] [*custom-stats*]',
		usage:
			'_[creature]_: The bestiary creature. Select "Custom NPC" for a simple initiative entry with no stats.\n' +
			'_[*name*]_: The name to apply to the npc in the initiative.\n' +
			'_[*dice*] optional_: The dice expression ("1d20+5") to use to join initiative.\n' +
			'_[*value*] optional_: The static value ("15") to use to join initiative.\n' +
			"_[*hide-stats*] optional_: Whether to hide the creature's stats. Defaults to hiding." +
			'_[*custom-stats*] optional_: Custom stats for a custom npc or to overwrite on a bestiary creature. ' +
			'Enter values in the format statName=statValue, separated by semicolons. If the value is a list like with immunities, ' +
			'separate each value with a comma. For weaknesses/resistances, follow this example: ' +
			'"hp=30;ac=21;immunities=poison,electricity;fire weakness=5;cold resistance=10',
		description: `Adds an NPC or minion to initiative`,
		expandedDescription:
			'Adds a bestiary creature to the initiative. By default, the creature will ' +
			'roll initiative using its perception skill. You can alternatively ' +
			'provide a dice expression or static value to use instead. If you provide a ' +
			'custom name, it will be used instead of the creature name in the initiative. ' +
			'If you choose the "Custom NPC" option, your creature will be added with an empty stat block.',
		interactions: {
			joinedEmbed: {
				rolledTitle: '{actorName} rolled initiative!',
				joinedTitle: '{actorName} joined initiative!',
				description: 'Initiative: {finalInitiative}',
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
