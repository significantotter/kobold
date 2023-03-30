export default {
	name: 'action',
	description: 'Commands for creating and modifying custom, rollable actions.',
	interactions: {
		notFound: "Yip! I couldn't find a action with that name.",
		tooMany: "Yip! A character can't have over 50 actions!",
	},
	create: {
		name: 'create',
		description: 'Creates an action.',
		interactions: {
			created: 'Yip! I created the action {actionName} for {characterName}.',
			alreadyExists: 'Yip! A action named {actionName} already exists for {characterName}.',
		},
	},
	createSpell: {
		name: 'create-spell',
		description: 'Creates a spell action with spell-specific properties.',
	},
	remove: {
		name: 'remove',
		description: 'Removes an action',
		interactions: {
			removeConfirmation: {
				text: `Are you sure you want to remove the action {actionName}?`,
				removeButton: 'REMOVE',
				cancelButton: 'CANCEL',
				expired: 'Yip! Action removal request expired.',
			},
			cancel: 'Yip! Canceled the request to remove the action!',
			success: 'Yip! I removed the action {actionName}.',
		},
	},
	addRoll: {
		name: 'add-roll',
		description: 'Adds a roll to an action',
	},
	addSave: {
		name: 'add-save',
		description: 'Adds a saving throw to an action',
	},
	removeRoll: {
		name: 'remove-roll',
		description: 'Removes a roll from an action',
	},
	import: {
		name: 'import',
		description: 'Imports actions from a Pastebin url.',
	},
	export: {
		name: 'export',
		description: 'Exports actions to a Pastebin url.',
	},
	list: {
		name: 'list',
		description: "Lists all of your character's actions.",
		interactions: {
			actionListEmbed: {
				title: "{characterName}'s actions",
			},
		},
	},
};
