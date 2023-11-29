export default {
	// MAIN COMMAND INFO
	name: 'character',
	description: 'Character management',

	// SHARED INTERACTIONS
	interactions: {
		noActiveCharacter: `Yip! You don't have any active characters! Use /import to import one.`,

		authenticationRequest:
			`Yip! Before you can {action} a character, you need to authenticate it. ` +
			`Give me permission to read your wanderer's guide character by following the link ` +
			`below. Then, /character {action} your character again!`,
		expiredToken:
			`Yip! It's been a while since I last authenticated your character, so our ` +
			`authentication expired. Please give me permission to read your wanderer's guide ` +
			`character again by following the link below`,
		authenticationLink: `Yip! Please follow  [this link]({wgBaseUrl}?characterId={charId}) to give me access to your character!`,
		tooManyWGRequests: `Yip! Wanderer's Guide told me I'm being pesky and sending too many requests! Try again in a moment.`,
	},

	// SUBCOMMANDS
	importWanderersGuide: {
		name: 'import-wanderers-guide',
		options: '[url]',
		usage: "_[url]_: the url of your character sheet from wanderer's guide",
		description: "Imports a Wanderer's Guide Character",
		expandedDescription:
			'Imports a character from ' +
			'the provided url. If the url is accurate, Kobold will make sure it ' +
			"has authorization to read your character from Wanderer's Guide, and " +
			'then import that character. Otherwise, a link will be provided for you ' +
			"to grant kobold authorization.\n\n If you're unable to find the character's " +
			"url, you can alternately just paste their Wanderer's Guide character id " +
			'into the url field.',
		interactions: {
			invalidUrl:
				`Yip! I couldn't find the character at the url '{url}'. Check ` +
				`and make sure you copied it over correctly! Or just paste ` +
				`in the character's id value instead.`,
			characterAlreadyExists:
				`Yip! You already have a character named {characterName}!` +
				` Did you mean to /character update?`,
			success: `Yip! I've successfully imported {characterName}!`,
		},
	},
	importPathbuilder: {
		name: 'import-pathbuilder',
		options: '[json-id] ',
		usage: '_[json-id]_: the json export id for your Pathbuilder account',
		description: 'Imports a PathBuilder 2E Character',
		expandedDescription:
			'Imports a character from PathBuilder 2E with ' +
			'the provided json id. If the id is accurate, Kobold will make fetch the character. ' +
			"NOTE that json ids are NOT unique for each character, they're unique for each Pathbuilder " +
			'account. If you have multiple characters in PathBuilder, make sure that the character you want to import ' +
			'is the one you most recently exported to json.',
		interactions: {
			invalidUrl:
				`Yip! I couldn't find any character at the json id '{id}'. Check ` +
				`and make sure you copied it over correctly! Or just paste ` +
				`in the character's id value instead.`,
			characterAlreadyExists:
				`Yip! You already have a character named {characterName}!` +
				` Did you mean to /character update?`,
			failedRequest:
				'Yip! I ran into an issue importing that character. Try again later, ' +
				'make sure that the json import id is correct, or contact my developer ' +
				`in my support server]({supportServerUrl})`,
			success: `Yip! I've successfully imported {characterName}!`,
		},
	},
	importPasteBin: {
		name: 'import-pastebin',
		options: '[url] ',
		usage: '_[url]_: the pastebin url with the character you want to import',
		description: 'Imports kobold-format Character data saved in pastebin',
		expandedDescription:
			'Imports a kobold character from a PasteBin URL. This command should be used ' +
			'in conjunction with a third party tool that exports characters in Kobold sheet formatting.',
		interactions: {
			invalidUrl:
				`Yip! I couldn't find any character at the url '{url}'. Check ` +
				`and make sure you copied it over correctly!`,
			characterAlreadyExists:
				`Yip! You already have a character named {characterName}!` +
				` Did you mean to /character update?`,
			success: `Yip! I've successfully imported {characterName}!`,
		},
	},
	list: {
		name: 'list',
		description: 'lists all active characters',
		expandedDescription:
			'Displays a list of all characters imported ' +
			'into Kobold. You can check the name of each character and a quick summary ' +
			"of that character's information.",
		interactions: {
			noCharacters: `Yip! You don't have any characters yet! Use /import to import some!`,
			characterListEmbed: {
				title: 'Characters',
				characterFieldName:
					'{characterName}{activeText?}{serverDefaultText?}{channelDefaultText?}',
				characterFieldValue: 'Level {level} {heritage} {ancestry} {classes}',
			},
		},
	},
	remove: {
		name: 'remove',
		description: 'removes an already imported character',
		expandedDescription:
			'Attempts to remove your currently active character. ' +
			"This has no effect on your character in Pathbuilder or Wanderer's Guide, Kobold simply " +
			'forgets about it. \n\nThe command will prompt you if you really wish to remove ' +
			'your character. If you do, you can still import that character back to ' +
			'Kobold in the future.',
		interactions: {
			removeConfirmation: {
				text: `Are you sure you want to remove {characterName}?`,
				removeButton: 'REMOVE',
				cancelButton: 'CANCEL',
				expired: 'Yip! Character removal request expired.',
			},
			success: `Yip! I've successfully removed {characterName}! You can import them again at any time.`,
			cancelled: `Yip! Canceled the request to remove {characterName}!`,
		},
	},
	setActive: {
		name: 'set-active',
		options: '[name]',
		usage: '_[name]_: the name of the character in Kobold to set active',
		description: 'sets a character as the active character',
		expandedDescription:
			'Sets the character matching the provided name ' +
			'as your active character. Your active character is the one used for ' +
			'commands like /character sheet, /roll, /init, or /character update.',
		interactions: {
			success: 'Yip! {characterName} is now your active character!',
			notFound:
				"Yip! I couldn't find a character matching that name! " +
				"Check what characters you've imported using /character list",
		},
	},
	setDefault: {
		name: 'set-default',
		options: '[default-for] [name]',
		usage:
			"_[default-for]_: Whether we're setting the default character for the channel or for the server.\n" +
			'_[name]_: the name of the character in Kobold to set as the server default',
		description: 'sets a character as the default character for the channel/server',
		expandedDescription:
			'Sets the character matching the provided name ' +
			'as the default character used for commands in this channel/server. This applies to ' +
			'commands like /character sheet, /roll, /init, or /character update. Your default ' +
			'overrides your active character. A channel default character overrides a server default character.',
		noneOption: '(None)',
		interactions: {
			success: 'Yip! {characterName} is now your default character on this {scope}!',
			removed:
				'Yip! I removed your default character for this {scope}. This {scope} will ' +
				'now use your active character for commands again.',
			notFound:
				"Yip! I couldn't find a character matching that name! " +
				"Check what characters you've imported using /character list",
		},
	},
	sheet: {
		name: 'sheet',
		description: "displays the active character's sheet",
		expandedDescription:
			'Displays a character sheet for your currently active ' +
			"character. The displayed stats are provided by wanderer's guide. These " +
			'stats are used for any dice commands relating to the character.',
		interactions: {
			sheet: {
				coreDataField: {
					name: 'Level {level} {heritage} {ancestry} {classes}\n',
					maxHpField: 'Max HP `{health}`',
					resolveField: 'Max Resolve `{resolve}`',
					staminaField: 'Max Stamina `{stamina}`',
					acField: 'AC `{armorClass}`',
					perceptionField: 'Perception `{perceptionModifier}` (DC {perceptionDC})',
					classDcField: '{classes} DC `{classDC}`',
					speedField: 'Speed `{speed}`\n',
					backgroundField: 'Background: {background}',
				},
				abilitiesField: {
					name: 'Abilities',
				},
				savesField: {
					name: 'Saves',
				},
				skillsField: {
					name: 'Skills',
				},
			},
		},
	},
	update: {
		name: 'update',
		description: 'updates an already imported character',
		expandedDescription:
			'Updates your currently active ' +
			"character with any new information from Pathbuilder or Wanderer's Guide. \n\nIf some " +
			"time has passed since you authorized kobold to read a Wanderer's Guide character's " +
			'information, you may be asked to authenticate again.\n\n If you are updating a ' +
			'Pathbuilder character, you will need to provide the json export id for your pathbuilder account and' +
			'make sure to export your character to json in Pathbuilder before using this command.',
		interactions: {
			success: `Yip! I've successfully updated {characterName}!`,
			canceled: 'Yip! Canceled the request to update {characterName}!',
			pathbuilderRequireId:
				'Yip! In order to update your pathbuilder character, I need to to provide me ' +
				'new JSON export id in the `/character update` command.',
		},
	},
};
