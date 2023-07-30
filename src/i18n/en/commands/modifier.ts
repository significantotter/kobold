export default {
	name: 'modifier',
	description: 'Toggleable values to modify specified dice rolls.',

	interactions: {
		notFound: "Yip! I couldn't find a modifier with that name.",
		tooMany: "Yip! A character can't have over 50 modifiers!",
		detailHeader: '{modifierName}{modifierIsActive}',
		detailBody:
			'{modifierDescriptionText}\nType: `{modifierType}`\nValue: `{modifierValue}`\nApplies to: `{modifierTargetTags}`',
	},
	list: {
		name: 'list',
		description: 'Lists all modifiers available to your active character.',
	},
	detail: {
		name: 'detail',
		description: 'Describes a modifier available to your active character.',
	},
	toggle: {
		name: 'toggle',
		description: 'Toggles whether a modifier is currently applying to your active character.',
		interactions: {
			success:
				'Yip! {characterName} had their modifier {modifierName} set to {activeSetting}.',
			active: 'active',
			inactive: 'inactive',
		},
	},
	update: {
		name: 'update',
		description: 'Updates a modifier for your active character.',
		interactions: {
			invalidOptionError: 'Yip! Please send a valid option to update.',
			emptyNameError: "Yip! You can't use an empty name!",
			nameExistsError: 'Yip! A modifier with that name already exists.',
			valueNotNumberError: 'Yip! You can only update a modifier value with a number.',
			successEmbed: {
				title: "Yip! {characterName} had their modifier {modifierName}'s {fieldToChange} set to {newFieldValue}.",
			},
		},
	},
	createRollModifier: {
		name: 'create-roll-modifier',
		description: 'Creates a roll modifier for the active character.',
		interactions: {
			created: 'Yip! I created the modifier {modifierName} for {characterName}.',
			alreadyExists:
				'Yip! A modifier named {modifierName} already exists for {characterName}.',
			invalidTags:
				"Yip! I didn't understand the target tag expression you provided. Tags can be" +
				' any expression in a format like "attack or skill". ' +
				'See [this link](https://github.com/joewalnes/filtrex) for more details.',
			doesntEvaluateError: 'Yip! That modifier is not a valid number or dice roll.',
		},
	},
	createSheetModifier: {
		name: 'create-sheet-modifier',
		description: 'Creates a sheet modifier for the active character.',
	},
	remove: {
		name: 'remove',
		description: 'Removes a modifier for the active character.',

		interactions: {
			removeConfirmation: {
				text: `Are you sure you want to remove the modifier {modifierName}?`,
				removeButton: 'REMOVE',
				cancelButton: 'CANCEL',
				expired: 'Yip! Modifier removal request expired.',
			},
			cancel: 'Yip! Canceled the request to remove the modifier!',
			success: 'Yip! I removed the modifier {modifierName}.',
		},
	},
	export: {
		name: 'export',
		description:
			'Exports a chunk of modifier data for you to later import on another character.',
		interactions: {
			success:
				"Yip! I've saved {characterName}'s modifiers to [this PasteBin link]({pasteBinLink})",
		},
	},
	import: {
		name: 'import',
		description: 'Imports a list of modifier data to a character from PasteBin.',
		expandedDescription:
			'Imports a list of modifier data to a character from PasteBin. Use ' +
			'exported data from another character. Only try to modify it if you know how to work with JSON!',
		interactions: {
			failedParsing:
				"Yip! I can't figure out how to read that! Try exporting another modifier to check and make " +
				"sure you're formatting it right!",
			badUrl: "Yip! I don't understand that Url! Copy the pastebin url for the pasted modifiers directly into the Url field.",
			imported: 'Yip! I successfully imported those modifiers to {characterName}.',
		},
	},
};
