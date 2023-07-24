export default {
	name: 'settings',
	description: 'Settings to customize your experience with Kobold.',

	set: {
		name: 'set',
		description: 'Set a user setting.',
		options: '[option] [value]',
		usage:
			'**[option]**: Which setting to change.\n' +
			'**[value]**: What to update the setting to.\n',
	},
};
