export default {
	// ACTION
	actionName: {
		name: 'name',
		description: 'The name of the action.',
	},
	actionDescription: {
		name: 'description',
		description: 'The description of the action.',
	},
	actionType: {
		name: 'action-type',
		description: 'The type of action.',
		choices: {
			attack: {
				name: 'attack',
				value: 'attack',
			},
			spell: {
				name: 'spell',
				value: 'spell',
			},
			other: {
				name: 'other',
				value: 'other',
			},
		},
	},
	actionTarget: {
		name: 'action',
		description: 'The target action.',
	},
	actionActions: {
		name: 'actions',
		description: 'The number of actions used.',
		choices: {
			reaction: {
				name: 'reaction',
				value: 'reaction',
			},
			free: {
				name: 'free',
				value: 'free',
			},
			one: {
				name: 'one',
				value: 'one',
			},
			two: {
				name: 'two',
				value: 'two',
			},
			three: {
				name: 'three',
				value: 'three',
			},
			variable: {
				name: 'variable',
				value: 'variable',
			},
		},
	},
	actionBaseLevel: {
		name: 'base-level',
		description:
			'The default (and minimum) level of the action. Access this value in a roll with [actionLevel].',
	},
	actionAutoHeighten: {
		name: 'auto-heighten',
		description: "Whether to default [actionLevel] to half the character's level rounded up.",
	},
	actionRollTarget: {
		name: 'target-roll',
		description: 'The target roll.',
	},
	actionRollName: {
		name: 'roll-name',
		description: 'The name of the roll.',
	},
	actionDiceRoll: {
		name: 'dice-roll',
		description: 'The dice rolled for the action.',
	},
	actionRollTags: {
		name: 'tags',
		description: 'the tags used to describe the roll.',
	},
	actionImportUrl: {
		name: 'url',
		description: 'The url to import from',
	},
	actionImportMode: {
		name: 'mode',
		description: 'The import mode to use.',
		choices: {
			fullyReplace: {
				name: 'overwrite-all',
				value: 'overwrite-all',
			},
			overwrite: {
				name: 'overwrite-on-conflict',
				value: 'overwrite-on-conflict',
			},
			renameOnConflict: {
				name: 'rename-on-conflict',
				value: 'rename-on-conflict',
			},
			ignoreOnConflict: {
				name: 'ignore-on-conflict',
				value: 'ignore-on-conflict',
			},
		},
	},

	// CHARACTER

	wgUrl: {
		name: 'url',
		description: "The url of your wanderer's guide character.",
	},
	name: {
		name: 'name',
		description: "The name of your wanderer's guide character.",
	},
	id: {
		name: 'character_id',
		description: `The id of your wanderer's guide character.`,
	},

	// GAME

	gameManageOption: {
		name: 'manage-option',
		description: 'What you want to do to manage a game',
		choices: {
			create: {
				name: 'create',
				value: 'create',
			},
			join: {
				name: 'join',
				value: 'join',
			},
			setActive: {
				name: 'set-active',
				value: 'set-active',
			},
			leave: {
				name: 'leave',
				value: 'leave',
			},
			kick: {
				name: 'kick',
				value: 'kick',
			},
			delete: {
				name: 'delete',
				value: 'delete',
			},
		},
	},
	gameManageValue: {
		name: 'manage-value',
		description:
			'Enter the name of the game if creating, otherwise pick between possible choices for the action.',
	},
	gameTargetCharacter: {
		name: 'game-target-character',
		description: 'Rolls for a single character instead of all characters.',
	},
	gameRollType: {
		name: 'game-roll-type',
		description: 'The type of roll for the characters to make',
	},
	gameDiceRollOrModifier: {
		name: 'dice-roll-or-modifier',
		description: 'the dice roll if doing a custom roll, or a modifier to add to the roll.',
	},

	// INIT

	initValue: {
		name: 'value',
		description: 'A value to set your initiative to. Overwrites any other init options.',
	},
	initActor: {
		name: 'name',
		description: 'The name of the NPC/minion to add to initiative.',
	},
	initCharacter: {
		name: 'character',
		description: 'A character present in the initiative.',
	},
	initSetOption: {
		name: 'option',
		description: 'The character option to alter (only within this initiative).',
		choices: {
			initiative: {
				name: 'initiative',
				value: 'initiative',
			},
			actorName: {
				name: 'name',
				value: 'name',
			},
		},
	},
	initSetValue: {
		name: 'value',
		description: 'The value to set the option to.',
	},

	// MODIFIER

	modifierName: {
		name: 'name',
		description: 'The name of the modifier.',
	},
	modifierType: {
		name: 'type',
		description: 'The optional type (status, item, or circumstance) of the modifier.',
	},
	modifierDescription: {
		name: 'description',
		description: 'A description for the modifier.',
	},
	modifierValue: {
		name: 'value',
		description: 'The value applied by the modifier to dice rolls.',
	},
	modifierTargetTags: {
		name: 'target-tags',
		description:
			'A set of tags for the rolls that this modifier applies to. For example "skill or attack or save"',
	},
	modifierSetOption: {
		name: 'option',
		description: 'The modifier option to alter.',
		choices: {
			name: {
				name: 'name',
				value: 'name',
			},
			description: {
				name: 'description',
				value: 'description',
			},
			type: {
				name: 'type',
				value: 'type',
			},
			value: {
				name: 'value',
				value: 'value',
			},
			targetTags: {
				name: 'target-tags',
				value: 'target-tags',
			},
		},
	},
	modifierSetValue: {
		name: 'value',
		description: 'The value to set the option to.',
	},
	modifierCustomOption: {
		name: 'custom',
		description: 'Whether to view custom created modifiers, default modifiers, or both.',
		choices: {
			custom: {
				name: 'custom',
				value: 'custom',
			},
			default: {
				name: 'default',
				value: 'default',
			},
			both: {
				name: 'both',
				value: 'both',
			},
		},
	},
	modifierImportMode: {
		name: 'import-mode',
		description: 'What to do when importing data.',
		choices: {
			fullyReplace: {
				name: 'overwrite-all',
				value: 'overwrite-all',
			},
			overwrite: {
				name: 'overwrite-on-conflict',
				value: 'overwrite-on-conflict',
			},
			renameOnConflict: {
				name: 'rename-on-conflict',
				value: 'rename-on-conflict',
			},
			ignoreOnConflict: {
				name: 'ignore-on-conflict',
				value: 'ignore-on-conflict',
			},
		},
	},
	modifierImportUrl: {
		name: 'url',
		description: 'The pastebin url with the modifier code to import.',
	},

	// ROLL

	saveChoice: {
		name: 'save',
		description: 'The save to roll.',
	},
	skillChoice: {
		name: 'skill',
		description: 'The skill to roll.',
		overwrites: {
			initJoinDescription: 'The skill to use for initiative instead of perception.',
		},
	},
	abilityChoice: {
		name: 'ability',
		description: 'The ability to roll.',
	},
	attackChoice: {
		name: 'attack',
		description: 'The attack to roll.',
	},
	rollExpression: {
		name: 'dice',
		description: 'The dice expression to roll. Similar to Roll20 dice rolls.',
		overwrites: {
			initAddDescription: 'Dice to roll to join initiative.',
			initJoinDescription:
				'Dice to roll to join initiative. ' + 'Modifies your skill if you chose a skill.',
		},
	},
	rollSecret: {
		name: 'secret',
		description: 'Whether to send the roll in a hidden, temporary message.',
		choices: {
			public: {
				name: 'public',
				value: 'public',
				description: 'A public roll.',
			},
			secret: {
				name: 'secret',
				value: 'secret',
				description: 'A temporary, hidden roll viewable only to you.',
			},
			secretAndNotify: {
				name: 'secret-and-notify',
				value: 'secret-and-notify',
				description: 'A secret roll that still notifies the channel that a roll was made.',
			},
		},
	},
	rollModifier: {
		name: 'modifier',
		description: 'A dice expression to modify your roll. (e.g. "+ 1 + 1d4")',
	},
	attackRollModifier: {
		name: 'attack_modifier',
		description: 'A dice expression to modify your attack roll. (e.g. "+ 1 + 1d4")',
	},
	damageRollModifier: {
		name: 'damage_modifier',
		description: 'A dice expression to modify your damage roll. (e.g. "+ 1 + 1d4")',
	},
	rollNote: {
		name: 'note',
		description: 'A note about the reason for the roll.',
	},
};
