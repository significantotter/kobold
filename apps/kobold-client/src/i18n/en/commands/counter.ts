export default {
	name: 'counter',
	description: 'Custom counters to track xp, per-day abilities, etc.',

	interactions: {},
	list: {
		name: 'list',
		description: 'Lists all counters available to your active character.',
	},
	display: {
		name: 'display',
		description: 'Displays a counter for your active character.',
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
			successEmbed: {
				title: "Yip! {characterName} had their counter {counterName} set to '{newCounterValue}'.",
			},
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
