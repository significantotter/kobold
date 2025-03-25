export default {
	name: 'condition',
	description: 'Commands for applying conditions to characters or creatures.',
	interactions: {
		created: 'Yip! I applied the condition {conditionName} to {characterName}.',
		alreadyExists: 'Yip! A condition named {conditionName} already exists for {characterName}.',
		invalidTags:
			"Yip! I didn't understand the target tag expression you provided. Tags can be" +
			' any expression in a format like "attack or skill".',
		doesntEvaluateError: 'Yip! That condition is not a valid number or dice roll.',
		removeConfirmation: {
			text: `Are you sure you want to remove the condition {conditionName}?`,
			removeButton: 'REMOVE',
			cancelButton: 'CANCEL',
			expired: 'Yip! Condition removal request expired.',
		},
		cancel: 'Yip! Canceled the request to remove the condition!',
		success: 'Yip! I removed the condition {conditionName}.',
		notFound: "Yip! I couldn't find a condition with that name.",
	},
	applyCustom: {
		name: 'apply-custom',
		description: 'Applies a custom condition to a target',
	},
	applyModifier: {
		name: 'apply-modifier',
		description: 'Applies your existing modifier to a target as a condition',
	},
	list: {
		name: 'list',
		description: "Lists all of a character's conditions",
	},
	set: {
		name: 'set',
		description: 'Sets a property of a condition on a target',
		interactions: {
			invalidOptionError: 'Yip! Please send a valid option to update.',
			emptyNameError: "Yip! You can't use an empty name!",
			nameExistsError: 'Yip! A condition with that name already exists.',
			valueNotNumberError: 'Yip! You can only update a condition value with a number.',
			successEmbed: {
				title: "Yip! {characterName} had their condition {conditionName}'s {fieldToChange} set to {newFieldValue}.",
			},
		},
	},
	remove: {
		name: 'remove',
		description: 'Removes a condition from a target',
	},
	severity: {
		name: 'severity',
		description: 'Changes the severity of a condition on a target',
	},
};
