export default {
	name: 'modifier',
	description: 'Toggleable values to modify specified dice rolls.',

	interactions: {
		notFound: "Yip! I couldn't find a modifier with that name.",
		detailHeader: '{modifierName}{modifierIsActive}',
	},
	list: {
		name: 'list',
		description: 'Lists all modifiers available to your active character.',
	},
	detail: {
		name: 'detail',
		description: 'Describes a modifier available to your active character.',
	},
	severity: {
		name: 'severity',
		description: 'Set the severity of a modifier.',
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
	set: {
		name: 'set',
		description: 'Sets a field for a modifier for your active character.',
		interactions: {
			invalidOptionError: 'Yip! Please send a valid option to set.',
			emptyNameError: "Yip! You can't use an empty name!",
			nameExistsError: 'Yip! A modifier with that name already exists.',
			valueNotNumberError: 'Yip! You can only set a modifier value with a number.',
			successEmbed: {
				title: "Yip! {characterName} had their modifier {modifierName}'s {fieldToChange} set to {newFieldValue}.",
			},
		},
	},
	createModifier: {
		name: 'create-modifier',
		description: 'Creates a modifier for the active character.',
		usage:
			'[name]: The name of the sheet modifier.\n' +
			'[type]: The in-game type of the modifier. "untyped" will always stack.\n' +
			'[sheet-adjustment]: The properties to modify and their values. For example: ' +
			'"ac=20;dex checks-1;occultAttack+2;" This would overwrite your ac to 20, ' +
			'subtract 1 from of all your dexterity dice checks, and increase your occult spell attack by 2\n' +
			'[roll-adjustment]: The roll portion of the modifier. For example: "1d6" \n' +
			'[roll-target-tags]: The tags that the roll portion of the modifier applies to. For example: "attack or skill"',
		expandedDescription:
			"Sheet modifiers are conditional bonuses or penalties that apply to a character's sheet. " +
			'They can be used to modify any value on your character sheet. \n\n' +
			'Formatting sheet modifiers is simple. The format is: `property=value;property+value;property-value`. ' +
			'You provide properties, values, and either "+", "-", or "=" to modify the property. You can + or - or = any ' +
			'numeric property. But a property like "imageURL" can only be set with =, since it isn\'t a number. ' +
			'Use ";" to separate multiple properties\n\n' +
			'**Numeric Properties:** \n\n' +
			'General: age, fly speed, swim speed, climb speed, focus points, perception\n' +
			'Attributes: strength, dexterity, constitution, intelligence, wisdom, charisma, speed, ' +
			'Defenses: ac, max hp, max resolve, max stamina \n' +
			'Abilities/Spellcasting: class dc, class attack, arcane attack, arcane dc, divine attack, divine dc \n' +
			'occult attack, occult dc, primal attack, primal dc, ' +
			'Saves: fortitude, reflex, will, acrobatics \n' +
			'Skills: athletics, crafting, deception, diplomacy, intimidation, medicine, nature, occultism, ' +
			'performance, religion, society, stealth, survival, thievery\n\n' +
			'**Non-numeric Properties:** \n' +
			'name, description, gender, age, alignment, deity, imageURL, size \n\n\n' +
			'Roll modifiers are conditional bonuses or penalties that apply to certain dice rolls. ' +
			'Which dice rolls are affected is based on a system of "tags." For example, every attack roll has ' +
			'the `attack` tag and every skill roll has the `skill` tag. A full list of tags are available under ' +
			'`/help attributes-and-tags`. \n\nModifiers can be toggled active or inactive. When inactive, a ' +
			'modifier will never apply to a roll, even if it applies to the given tags.\n\n\n' +
			'**How to target rolls with target-tags**\n\n' +
			'\t**or**\n\n' +
			'`or` means you need EITHER tag in the roll.\n\n' +
			'`attack or save` means that the roll can either be an attack roll OR a save roll\n\n\n' +
			'\t**and**\n\n' +
			'`and` means you needs BOTH tags in the roll.\n\n' +
			"`attack and save` means the roll must be an attack roll AND a save roll, which doesn't happen!!\n\n" +
			'`skill and intimidation` would be true on any intimidation roll, because intimidation also has the skill tag!\n\n' +
			'\t**not**\n\n' +
			'`not` means that the roll applies to things that are not that tag \n\n' +
			'`skill and not strength` applies to skill rolls that are NOT strength skills\n\n\n' +
			'\t**Parentheses**\n\n' +
			'Parentheses group tags. () \n\n' +
			'`attack and (skill or dexterity)` requires attack and for the group to be valid! ' +
			'So BOTH attack and EITHER skill or dexterity must be in the roll\n\n\n' +
			'**Advanced**\n\n' +
			'To learn how to build target tags ' +
			'you can also reference [this link](https://github.com/joewalnes/filtrex), although its fairly technical.',
		interactions: {
			created: 'Yip! I created the modifier {modifierName} for {characterName}.',
			alreadyExists:
				'Yip! A modifier named {modifierName} already exists for {characterName}.',
			invalidTags:
				"Yip! I didn't understand the target tag expression you provided. Tags can be" +
				' any expression in a format like "attack or skill".',
			doesntEvaluateError: 'Yip! That modifier is not a valid number or dice roll.',
		},
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
