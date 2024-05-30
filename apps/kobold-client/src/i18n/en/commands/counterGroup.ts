export default {
	name: 'counter-group',
	description: 'Groups of related counters.',

	interactions: {
		notFound: "Yip! I couldn't find a counter group named {groupName}.",
	},
	list: {
		name: 'list',
		description: 'Lists all counter groups available to your active character.',
	},
	display: {
		name: 'display',
		description: 'Displays a counter group for your active character.',
	},
	create: {
		name: 'create',
		description: 'Creates a counter group for the active character.',
		interactions: {
			created: 'Yip! I created the counter group {groupName} for {characterName}.',
			alreadyExists:
				'Yip! A counter group named {groupName} already exists for {characterName}.',
		},
	},
	set: {
		name: 'set',
		description: 'Sets the value of a counter group for your active character.',
		interactions: {
			invalidOptionError: 'Yip! Please choose a valid option to set.',
			stringTooLong: "Yip! {propertyName} can't be longer than {numCharacters} characters!",
			nameExistsError: 'Yip! A modifier with that name already exists.',
			successEmbed: {
				title: "Yip! I set {propertyName} on {groupName} to {newPropertyValue}'.",
			},
		},
	},
	remove: {
		name: 'remove',
		description: 'Removes a counter group for the active character.',

		interactions: {
			removeConfirmation: {
				text: `Are you sure you want to remove the counter group {groupName}?`,
				removeButton: 'REMOVE',
				cancelButton: 'CANCEL',
				expired: 'Yip! Counter group removal request expired.',
			},
			cancel: 'Yip! Canceled the request to remove the counter group!',
			success: 'Yip! I removed the counter group {groupName}.',
		},
	},
};
