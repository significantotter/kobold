export default {
	name: 'action',
	description: 'Commands for creating and modifying custom, rollable actions.',
	interactions: {
		notFound: "Yip! I couldn't find a action with that name.",
		rollNotFound: "Yip! I couldn't find a stage of the action with that name.",
		rollAlreadyExists: 'Yip! A roll with that name already exists for this action.',
		rollAddSuccess: 'Yip! I added the {rollType} roll {rollName} to the action {actionName}.',
	},
	create: {
		name: 'create',
		description: 'Creates an action.',
		interactions: {
			created: 'Yip! I created the action {actionName} for {characterName}.',
			alreadyExists: 'Yip! An action named {actionName} already exists for {characterName}.',
		},
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
	set: {
		name: 'set',
		description: 'Sets a field on an action. "none" clears the field.',
		interactions: {
			success: 'Yip! {actionOption} was set to {newValue} for the action {actionName}.',
			invalidActionType: 'Yip! The valid action types are "spell", "attack", and "other".',
			invalidActionCost:
				'Yip! Valid action costs are "one", "two", "three", "free", "variable", and "reaction".',
			invalidInteger: 'Yip! This field must be a positive, whole number.',
			unknownField: "Yip! That's not a field I recognize for an action!",
		},
	},
	import: {
		name: 'import',
		description: 'Imports a list of action data to a character from PasteBin.',
		expandedDescription:
			'Imports a list of action data to a character from PasteBin. Use ' +
			'exported data from another character. Only try to modify it if you know how to work with JSON!',
		interactions: {
			failedParsing:
				"Yip! I can't figure out how to read that! Try exporting another action to check and make " +
				"sure you're formatting it right!",
			badUrl: "Yip! I don't understand that Url! Copy the pastebin url for the pasted actions directly into the Url field.",
			imported: 'Yip! I successfully imported those actions to {characterName}.',
		},
	},
	export: {
		name: 'export',
		description: 'Exports actions to a PasteBin url.',
		interactions: {
			success:
				"Yip! I've saved {characterName}'s modifiers to [this PasteBin link]({pasteBinLink})",
		},
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
	detail: {
		name: 'detail',
		description: 'Describes a specific action.',
		interactions: {
			actionListEmbed: {
				title: '{actionName}',
				description: '',
				attackRoll: '',
				saveRoll: '',
				textRoll: '',
				basicDamageRoll: '',
				specificDamageRoll: '',
			},
		},
	},
};
