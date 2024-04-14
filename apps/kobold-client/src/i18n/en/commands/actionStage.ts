export default {
	name: 'action-stage',
	description: 'Commands for adding stages (rolls, text, and saves) to custom, rollable actions.',
	interactions: {
		notFound: "Yip! I couldn't find a action with that name.",
		rollNotFound: "Yip! I couldn't find a stage of the action with that name.",
		rollAlreadyExists: 'Yip! A roll with that name already exists for this action.',
		rollAddSuccess: 'Yip! I added the {rollType} roll {rollName} to the action {actionName}.',
	},
	addAttack: {
		name: 'add-attack',
		description:
			"Adds an attack roll to an action. Can also be any type of roll against an enemy's DCs",
	},
	addSkillChallenge: {
		name: 'add-skill-challenge',
		description:
			'Adds a skill challenge roll to an action. This is any roll against your own DCs.',
	},
	addBasicDamage: {
		name: 'add-basic-damage',
		description:
			'Adds a basic damage roll to an action. Automatically adjusts for crits or failures.',
	},
	addAdvancedDamage: {
		name: 'add-advanced-damage',
		description:
			'Adds an advanced damage roll to an action. Requires manual input for all successes and failures.',
	},
	addText: {
		name: 'add-text',
		description:
			'Adds a text block to an action. Can include dice rolls surrounded by {addTextRollInput}',
		interactions: {
			requireText: 'Yip! You must provide at least one text input to add text to an action!',
			tooMuchText:
				'Yip! All of that text is too long to add to a single action text field! The different fields can only have' +
				' a maximum of 950 characters combined. Try splitting the text up into multiple fields!',
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
	update: {
		name: 'update',
		description: 'Updates a roll, text, or save on an action. "none" clears a field.',
		interactions: {
			success:
				'Yip! {actionStageOption} was set to {newValue} for action stage {actionStageName} in the action {actionName}.',
			unknownField: "Yip! That's not a field I recognize for action stages!",
			invalidField: 'Yip! That field is not valid for a {stageType} stage.',
		},
	},
	remove: {
		name: 'remove',
		description: 'Removes a roll, text, or save from an action',
		interactions: {
			success:
				'Yip! I removed the action stage {actionStageName} from the action {actionName}.',
		},
	},
};
