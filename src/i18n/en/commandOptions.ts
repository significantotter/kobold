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
				value: 'freeAction',
			},
			one: {
				name: 'one',
				value: 'oneAction',
			},
			two: {
				name: 'two',
				value: 'twoActions',
			},
			three: {
				name: 'three',
				value: 'threeActions',
			},
			variable: {
				name: 'variable',
				value: 'variableActions',
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
	actionStageEditOption: {
		name: 'edit-option',
		description: 'The option to edit.',
		choices: {
			name: { name: 'name', value: 'name' },
			targetDC: { name: 'target-dc', value: 'targetDC' },
			roll: { name: 'roll', value: 'roll' },
			successRoll: { name: 'success-roll', value: 'successRoll' },
			failureRoll: { name: 'failure-roll', value: 'failureRoll' },
			criticalSuccessRoll: { name: 'critical-success-roll', value: 'criticalSuccessRoll' },
			criticalFailureRoll: { name: 'critical-failure-roll', value: 'criticalFailureRoll' },
			allowRollModifier: { name: 'allow-roll-modifier', value: 'allowRollModifier' },
		},
	},
	actionEditOption: {
		name: 'edit-option',
		description: 'The option to edit.',
		choices: {
			name: { name: 'name', value: 'name' },
			description: { name: 'description', value: 'description' },
			type: { name: 'type', value: 'type' },
			actionCost: { name: 'action-cost', value: 'actionCost' },
			baseLevel: { name: 'base-level', value: 'baseLevel' },
			tags: { name: 'tags', value: 'tags' },
			autoHeighten: { name: 'auto-heighten', value: 'autoHeighten' },
		},
	},
	actionStageEditValue: {
		name: 'edit-value',
		description: 'The value to change the option to.',
	},
	actionRollName: {
		name: 'roll-name',
		description: 'The name of the roll.',
	},
	actionRollType: {
		name: 'type',
		description: 'The type of roll. Attack, damage, or other.',
		choices: {
			attack: {
				name: 'attack',
				value: 'attack',
			},
			damage: {
				name: 'damage',
				value: 'damage',
			},
			other: {
				name: 'other',
				value: 'other',
			},
		},
	},
	actionRollSave: {
		name: 'target-ac-save-or-skill',
		description: 'Whether the attack roll checks against AC, a Save DC, or a Skill DC.',
	},
	actionRollAbilityDc: {
		name: 'save-dc-type',
		description: 'Whether this saving throw is against your AC, Saving Throw, or Skill DC.',
	},
	actionSaveRollType: {
		name: 'save-roll-type',
		description: 'What the target rolls against the your DC.',
	},
	actionDiceRoll: {
		name: 'dice-roll',
		description:
			'The dice rolled for the action. (damage-only) Dice rolled for a regular success.',
	},
	actionRollAllowModifiers: {
		name: 'allow-modifiers',
		description:
			'Whether to allow modifiers to alter the roll. (Default: true). Ex. set to false for bonus damage',
	},
	actionBasicDamageDiceRoll: {
		name: 'basic-damage-dice-roll',
		description: 'A simple damage roll for an attack or save. Ignored if other rolls set.',
	},
	actionSuccessDiceRoll: {
		name: 'success-dice-roll',
		description: 'The damage dice optionally rolled for a success.',
	},
	actionCriticalSuccessDiceRoll: {
		name: 'critical-success-dice-roll',
		description: 'The damage dice optionally rolled for a critical success.',
	},
	actionCriticalFailureDiceRoll: {
		name: 'critical-failure-dice-roll',
		description: 'The damage dice optionally rolled for a critical failure.',
	},
	actionFailureDiceRoll: {
		name: 'failure-dice-roll',
		description: 'The damage dice optionally rolled for a regular failure.',
	},
	actionDefaultText: {
		name: 'default-text',
		description: 'Text shown no matter the success of an attack or save.',
	},
	actionSuccessText: {
		name: 'success-text',
		description: 'Text displayed for a success. Inline rolls using the format {diceFormat}',
	},
	actionCriticalSuccessText: {
		name: 'critical-success-text',
		description:
			'Text displayed for a critical success. Inline rolls using the format {diceFormat}',
	},
	actionCriticalFailureText: {
		name: 'critical-failure-text',
		description:
			'Text displayed for a critical failure. Inline rolls using the format {diceFormat}',
	},
	actionFailureText: {
		name: 'failure-text',
		description:
			'Text displayed for a regular failure. Inline rolls using the format {diceFormat}',
	},
	actionExtraTags: {
		name: 'extra-tags',
		description:
			'Extra tags that can optionally apply certain modifiers to the inline text roll.',
	},
	actionTags: {
		name: 'tags',
		description: 'the tags used to describe this part of the action.',
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
	rollTargetDc: {
		name: 'target-dc',
		description: 'The DC to roll attacks against.',
	},
	rollSaveDiceRoll: {
		name: 'save-dice-roll',
		description: 'The dice roll to use for any saving throw in the action.',
	},
	attackRollModifier: {
		name: 'attack_modifier',
		description: 'A dice expression to modify your attack roll. (e.g. "+ 1 + 1d4")',
	},
	damageRollModifier: {
		name: 'damage_modifier',
		description: 'A dice expression to modify your damage roll. (e.g. "+ 1 + 1d4")',
	},
	otherRollModifier: {
		name: 'other_modifier',
		description: 'A dice expression to modify your "other" action rolls. (e.g. "+ 1 + 1d4")',
	},
	rollHeightenLevel: {
		name: 'heighten',
		description: 'The level to heighten the action to.',
	},
	rollNote: {
		name: 'note',
		description: 'A note about the reason for the roll.',
	},
};
