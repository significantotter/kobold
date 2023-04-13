export default {
	name: 'action',
	description: 'Commands for creating and modifying custom, rollable actions.',
	interactions: {
		notFound: "Yip! I couldn't find a action with that name.",
		rollNotFound: "Yip! I couldn't find a stage of the action with that name.",
		tooMany: "Yip! A character can't have over 50 actions!",
		rollAlreadyExists: 'Yip! A roll with that name already exists for this action.',
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
	addAttack: {
		name: 'add-attack',
		description: 'Adds an attack roll to an action',
		interactions: {
			success: 'Yip! I added the attack {rollName} to the action {actionName}.',
		},
	},
	addBasicDamage: {
		name: 'add-basic-damage',
		description:
			'Adds a basic damage roll to an action. Automatically adjusts for crits or failures.',
		interactions: {
			success: 'Yip! I added the damage roll {rollName} to the action {actionName}.',
		},
	},
	addAdvancedDamage: {
		name: 'add-advanced-damage',
		description:
			'Adds an advanced damage roll to an action. Requires manual input for all successes and failures.',
		interactions: {
			success: 'Yip! I added the damage roll {rollName} to the action {actionName}.',
		},
	},
	addText: {
		name: 'add-text',
		description: 'Adds a text block to an action. Can include dice rolls surrounded by [[]]',
		interactions: {
			requireText: 'Yip! You must provide at least one text input to add text to an action!',
		},
	},
	addSave: {
		name: 'add-save',
		description: 'Adds a saving throw to an action',
		interactions: {
			requireText:
				'Yip! You must provide at least one save result to add a save to an action!',
		},
	},
	editAction: {
		name: 'edit-action',
		description: 'Edits an action. "none" clears a field.',
		interactions: {
			success: 'Yip! {actionOption} was set to {newValue} for the action {actionName}.',
			invalidActionType: 'Yip! The valid action types are "spell", "attack", and "other".',
			invalidActionCost:
				'Yip! Valid action costs are "one", "two", "three", "free", "variable", and "reaction".',
			invalidInteger: 'Yip! This field must be a positive, whole number.',
			unknownField: "Yip! That's not a field I recognize for an action!",
		},
	},
	editActionStage: {
		name: 'edit-action-stage',
		description: 'Edits a roll, text, or save on an action. "none" clears a field.',
		interactions: {
			success:
				'Yip! {actionStageOption} was set to {newValue} for action stage {actionStageName} in the action {actionName}.',
			unknownField: "Yip! That's not a field I recognize for action stages!",
		},
	},
	removeActionStage: {
		name: 'remove-action-stage',
		description: 'Removes a roll, text, or save from an action',
		interactions: {
			success:
				'Yip! I removed the action stage {actionStageName} from the action {actionName}.',
		},
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
