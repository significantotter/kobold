export const GameCommandLang = {
	name: 'game',
	description: 'Commands for interacting with players as the GM of a game.',
	interactions: {
		notFound: "Yip! I couldn't find the game {gameName} in this server.",
		activeGameNotFound:
			"Yip! I couldn't find a game that you run in this server that you've set to active!",
	},
	manage: {
		name: 'manage',
		description:
			"Manage a a GM'd group of characters. Choose to create, delete, set-active, join, kick, or leave",
		expandedDescription:
			'Manage a game.\n' +
			'`/game manage [create] [game name]`\ncreates a game named "game name" in this discord server.\n' +
			'`/game manage [delete] [game name]`\ndeletes the game named "game name".\n' +
			'`/game manage [set-active] [game name]`\nsets the game "game name" as active for your /game commands.\n' +
			'`/game manage [join] [game name]`\njoins the game named "game name" with your active character\n' +
			'`/game manage [kick] [game name - character name]`\nkicks the character from the specified game.\n' +
			'`/game manage [leave] [game name]`\nleaves the game "game name" with your active character.',
		interactions: {
			gameAlreadyExists: 'Yip! A game with that name already exists in this server.',
			gameNameTooShort: "Yip! Your game's name needs to be at least 2 characters!",
			gameNameDisallowedCharacters:
				'Yip! Your game\'s name can\'t include " - ".' +
				' I use that to separate games from characters when kicking a character!',
			createSuccess: 'Yip! I created the game "{gameName}" in this server.',
			setActiveSuccess:
				'Yip! I set the game "{gameName}" as your active game in this server.',
			deleteSuccess: 'Yip! I deleted the game "{gameName}" in this server.',
			kickSuccess: 'Yip! I kicked {characterName} out of the game "{gameName}"!',
			kickParseFailed:
				"Yip! I couldn't tell the game and character apart! Try using one of the suggested options.",
			characterNotInGame:
				'Yip! I couldn\'t find the character {characterName} in the game "{gameName}"!',
			joinSuccess: 'Yip! {characterName} joined the game "{gameName}"!',
			leaveSuccess: 'Yip! {characterName} left the game "{gameName}"!',
		},
	},
	init: {
		name: 'init',
		description:
			'Starts an initiative and automatically causes all players in the game to join with the skill. GM only.',
	},
	roll: {
		name: 'roll',
		description: 'Rolls dice for all characters in a game (or optionally one). GM only.',
		options: '[game-roll-type] [*dice-roll-or-modifier*] [*game-target-character*] [*secret*]',
		usage:
			'**[game-roll-type]**: The name of the ability to roll.\n' +
			'**[*dice-roll-or-modifier*] optional**: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
			'of the roll if choosing a skill/ability/save. Alternatively, a simple modifier value ("5" or "-3").\n' +
			'**[*game-target-character*] optional**: Restricts the roll to just the specified character.\n' +
			'**[*secret*] optional**: Choose to either leave the roll public (default), hide the roll entirely, or ' +
			'hide the roll, but publicly notify the channel that a roll has been made.',
	},
};

export const GameCommandOptionsLang = {
	gameManageOption: {
		name: 'manage-option',
		description: 'What you want to do to manage a game',
		choices: {
			create: {
				name: 'create',
				value: 'create',
			},
			join: {
				name: 'join',
				value: 'join',
			},
			setActive: {
				name: 'set-active',
				value: 'set-active',
			},
			leave: {
				name: 'leave',
				value: 'leave',
			},
			kick: {
				name: 'kick',
				value: 'kick',
			},
			delete: {
				name: 'delete',
				value: 'delete',
			},
		},
	},
	gameManageValue: {
		name: 'manage-value',
		description:
			'Enter the name of the game if creating, otherwise pick between possible choices for the action.',
	},
	gameTargetCharacter: {
		name: 'game-target-character',
		description: 'Rolls for a single character instead of all characters.',
	},
	gameRollType: {
		name: 'game-roll-type',
		description: 'The type of roll for the characters to make',
	},
	gameDiceRollOrModifier: {
		name: 'dice-roll-or-modifier',
		description: 'the dice roll if doing a custom roll, or a modifier to add to the roll.',
	},
};
