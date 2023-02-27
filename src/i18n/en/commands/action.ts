export default {
	name: 'action',
	description: 'Commands for creating and modifying custom, rollable actions.',
	builder: {
		name: 'builder',
		description: 'Starts the action builder to help you create, update, or remove actions.',
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
