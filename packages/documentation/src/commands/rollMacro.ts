export default {
	name: 'roll-macro',
	description: 'Short roll that can be referenced and used by other rolls. Case insensitive.',

	interactions: {
		doesntEvaluateError: 'Yip! That macro causes an error when I try to evaluate it.',
		emptyValueError: "Yip! You can't use an empty value!",
		notFound: "Yip! I couldn't find a modifier with that name.",
		requiresActiveCharacter: 'Yip! You need to have an active character to use roll macros.',
	},
	list: {
		name: 'list',
		description: 'Lists all roll macros available to your active character.',
	},
	create: {
		name: 'create',
		description: 'Creates a roll macro for the active character.',
		interactions: {
			created: 'Yip! I created the roll macro {macroName} for {characterName}.',
			alreadyExists:
				'Yip! A roll macro named {macroName} already exists for {characterName}.',
		},
	},
	set: {
		name: 'set',
		description: 'Sets the value of a roll macro for your active character.',
		interactions: {
			successEmbed: {
				title: "Yip! {characterName} had their roll macro {macroName} set to '{newMacroValue}'.",
			},
		},
	},
	remove: {
		name: 'remove',
		description: 'Removes a roll macro for the active character.',

		interactions: {
			removeConfirmation: {
				text: `Are you sure you want to remove the roll macro {macroName}?`,
				removeButton: 'REMOVE',
				cancelButton: 'CANCEL',
				expired: 'Yip! Roll Macro removal request expired.',
			},
			cancel: 'Yip! Canceled the request to remove the roll macro!',
			success: 'Yip! I removed the roll macro {macroName}.',
		},
	},
};
