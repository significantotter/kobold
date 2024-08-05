export default {
	name: 'counter',
	description: 'Custom counters to track xp, per-day abilities, etc.',

	interactions: {
		invalidStyle: `Yip! The counter style {style} must be one of "prepared", "dots", or "default"!`,
		invalidForStyle: `Yip! The {parameter} option is invalid for a {style} counter!`,
		maxTooLarge: `Yip! The counter max value must be less than 20!`,
		maxTooSmall: `Yip! The counter max value must be a positive value, or -1 for no max.`,
		notFound: "Yip! I couldn't find a counter named {counterName}.",
		recoverToInvalid: `Yip! The recover to value must be a positive value, or -1 for the max value.`,
		notNumeric:
			'Yip! {counterName} is not a numeric counter. I can only adjust the value of a numeric (dots or default) counter. Use the `/counter use-slot` command to change the value of a prepared counter.',
		notPrepared:
			'Yip! {counterName} is not a prepared counter. I can only mark a slot as used from a prepared slots counter. Use the `/counter value` command to change the value of a numeric counter.',
	},
	list: {
		name: 'list',
		description: 'Lists all counters available to your active character.',
	},
	display: {
		name: 'display',
		description: 'Displays a counter for your active character.',
	},
	reset: {
		name: 'reset',
		description: 'Resets a counter for your active character.',
		interactions: {
			reset: "Yip! I reset {characterName}'s counter {counterName}.",
		},
	},
	useSlot: {
		name: 'use-slot',
		description: 'Uses a prepared slot on a counter for your active character.',
		interactions: {
			usedSlot: 'Yip! {characterName} {usedOrReset} {slotName} from {counterName}.',
		},
	},
	value: {
		name: 'value',
		description: 'Changes the value of a counter for your active character.',
		interactions: {
			adjustValue:
				'Yip! I {changeType} {changeValue} {toFrom} "{counterName}" resulting in {maxMin} {newValue}.',
			setValue: 'Yip! I set the value of "{counterName}" to {maxMin} {newValue}.',
		},
	},
	prepare: {
		name: 'prepare',
		description: "Prepares an expendable ability in a counter's slot.",
		interactions: {
			prepared: 'Yip! I prepared {slotName} on {characterName}\'s counter "{counterName}".',
		},
	},
	prepareMany: {
		name: 'prepare-many',
		description: "Prepares multiple expendable abilities in a counter's slots.",
		interactions: {
			prepared: 'Yip! I prepared {slotNames} on {characterName}\'s counter "{counterName}".',
		},
	},
	create: {
		name: 'create',
		description: 'Creates a counter for the active character.',
		interactions: {
			created: 'Yip! I created the counter {counterName} for {characterName}.',
			alreadyExists: 'Yip! A counter named {counterName} already exists for {characterName}.',
		},
	},
	set: {
		name: 'set',
		description: 'Sets the value of a counter for your active character.',
		interactions: {
			invalidOptionError: 'Yip! Please choose a valid option to set.',
			stringTooLong: "Yip! {propertyName} can't be longer than {numCharacters} characters!",
			nameExistsError: 'Yip! A counter with that name already exists.',
			successEmbed: {
				title: 'Yip! I set {propertyName} on {groupName} to {newPropertyValue}.',
			},
			invalidGroup: 'Yip! I could not find a counter group named {groupName}.',
			recoverToInvalid:
				'Yip! The recover to value must be less than the max value. Or -1 for the max value, or -2 for half the max value.',
		},
	},
	remove: {
		name: 'remove',
		description: 'Removes a counter for the active character.',

		interactions: {
			removeConfirmation: {
				text: `Are you sure you want to remove the counter {counterName}?`,
				removeButton: 'REMOVE',
				cancelButton: 'CANCEL',
				expired: 'Yip! Counter group removal request expired.',
			},
			cancel: 'Yip! Canceled the request to remove the counter!',
			success: 'Yip! I removed the counter {counterName}.',
		},
	},
};
