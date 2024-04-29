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
	actionSetOption: {
		name: 'set-option',
		description: 'The field to set to a new value.',
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
	actionSetValue: {
		name: 'set-value',
		description: 'The value to change the option to.',
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
	actionTarget: {
		name: 'action',
		description: 'The target action.',
	},

	// ACTION STAGE

	actionStageTarget: {
		name: 'action',
		description: 'The target action.',
	},
	actionStageSetValue: {
		name: 'set-value',
		description: 'The value to change the option to.',
	},
	actionStageRollName: {
		name: 'roll-name',
		description: 'The name of the roll.',
	},
	actionStageRollType: {
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
	actionStageRollSave: {
		name: 'target-ac-save-or-skill',
		description: 'Whether the attack roll checks against AC, a Save DC, or a Skill DC.',
	},
	actionStageRollAbilityDc: {
		name: 'save-dc-type',
		description: 'Whether this saving throw is against your AC, Saving Throw, or Skill DC.',
	},
	actionStageSaveRollType: {
		name: 'save-roll-type',
		description: 'What the target rolls against the your DC.',
	},
	actionStageDiceRoll: {
		name: 'dice-roll',
		description:
			'The dice rolled for the action. (damage-only) Dice rolled for a regular success.',
	},
	actionStageRollAllowModifiers: {
		name: 'allow-modifiers',
		description:
			'Whether to allow modifiers to alter the roll. (Default: true). Ex. set to false for bonus damage',
	},
	actionStageRollHealInsteadOfDamage: {
		name: 'heal-instead-of-damage',
		description: 'Whether to heal the target instead of doing damage',
	},
	actionStageDamageType: {
		name: 'damage-type',
		description: 'The type of damage dealt by the action.',
	},
	actionStageBasicDamageDiceRoll: {
		name: 'basic-damage-dice-roll',
		description: 'A simple damage roll for an attack or save. Ignored if other rolls set.',
	},
	actionStageSuccessDiceRoll: {
		name: 'success-dice-roll',
		description: 'The damage dice optionally rolled for a success.',
	},
	actionStageCriticalSuccessDiceRoll: {
		name: 'critical-success-dice-roll',
		description: 'The damage dice optionally rolled for a critical success.',
	},
	actionStageCriticalFailureDiceRoll: {
		name: 'critical-failure-dice-roll',
		description: 'The damage dice optionally rolled for a critical failure.',
	},
	actionStageFailureDiceRoll: {
		name: 'failure-dice-roll',
		description: 'The damage dice optionally rolled for a regular failure.',
	},
	actionStageDefaultText: {
		name: 'default-text',
		description: 'Text shown no matter the success of an attack or save.',
	},
	actionStageSuccessText: {
		name: 'success-text',
		description: 'Text displayed for a success. Inline rolls using the format {diceFormat}',
	},
	actionStageCriticalSuccessText: {
		name: 'critical-success-text',
		description:
			'Text displayed for a critical success. Inline rolls using the format {diceFormat}',
	},
	actionStageCriticalFailureText: {
		name: 'critical-failure-text',
		description:
			'Text displayed for a critical failure. Inline rolls using the format {diceFormat}',
	},
	actionStageFailureText: {
		name: 'failure-text',
		description:
			'Text displayed for a regular failure. Inline rolls using the format {diceFormat}',
	},
	actionStageExtraTags: {
		name: 'extra-tags',
		description:
			'Extra tags that can optionally apply certain modifiers to the inline text roll.',
	},
	actionStageRollTarget: {
		name: 'target-roll',
		description: 'The target roll.',
	},
	actionStageStageUpdateOption: {
		name: 'set-option',
		description: 'The field to set to a new value.',
		choices: {
			name: { name: 'name', value: 'name' },
			damageType: { name: 'damage-type', value: 'damageType' },
			allowRollModifiers: { name: 'allow-roll-modifier', value: 'allowRollModifiers' },
			attackTargetDC: { name: 'attack-target-dc', value: 'targetDC' },
			attackRoll: { name: 'attack-roll', value: 'roll' },
			basicDamageRoll: { name: 'basic-damage-roll', value: 'roll' },
			advancedDamageCritSuccessRoll: {
				name: 'advanced-damage-crit-success-roll',
				value: 'criticalSuccessRoll',
			},
			advancedDamageSuccessRoll: {
				name: 'advanced-damage-success-roll',
				value: 'successRoll',
			},
			advancedDamageFailureRoll: {
				name: 'advanced-damage-failure-roll',
				value: 'failureRoll',
			},
			advancedDamageCritFailureRoll: {
				name: 'advanced-damage-crit-failure-roll',
				value: 'criticalFailureRoll',
			},
			saveRollType: {
				name: 'save-roll-type',
				value: 'saveRollType',
			},
			saveTargetDC: { name: 'save-target-dc', value: 'saveTargetDC' },
			defaultText: { name: 'text-default', value: 'defaultText' },
			successText: { name: 'text-success', value: 'successText' },
			failureText: { name: 'text-failure', value: 'failureText' },
			criticalSuccessText: { name: 'text-critical-success', value: 'criticalSuccessText' },
			criticalFailureText: { name: 'text-critical-failure', value: 'criticalFailureText' },
			textExtraTags: { name: 'text-extra-tags', value: 'textExtraTags' },
			healInsteadOfDamage: { name: 'heal-instead-of-damage', value: 'healInsteadOfDamage' },
		},
	},
	actionStageStageMoveOption: {
		name: 'move-to',
		description: 'Whether to move the stage to the top or bottom.',
		choices: {
			top: { name: 'top', value: 'top' },
			bottom: { name: 'bottom', value: 'bottom' },
		},
	},

	// CHARACTER

	wgUrl: {
		name: 'wg-url',
		description: "The url of your wanderer's guide character.",
	},
	pbJsonId: {
		name: 'pathbuilder-json-id',
		description: 'The most recent json export id for your PathBuilder character.',
	},
	pastebinUrl: {
		name: 'pastebin-url',
		description: 'The pastebin link to the saved kobold character data.',
	},
	useStamina: {
		name: 'use-stamina',
		description:
			'Whether the PathBuilder character should use the variant stamina/resolve systems.',
	},
	name: {
		name: 'name',
		description: 'The name of your character.',
	},
	id: {
		name: 'character_id',
		description: `The id of your character.`,
	},
	setDefaultScope: {
		name: 'default-for',
		description:
			'Where this is your default character. Either a specific channel, or the whole guild.',
		choices: {
			channel: {
				name: 'channel',
				value: 'channel',
			},
			server: {
				name: 'server',
				value: 'server',
			},
		},
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

	// GAMEPLAY

	gameplaySetOption: {
		name: 'option',
		description: "What option to update on the target character's sheet",
		choices: {
			hp: {
				name: 'hp',
				value: 'hp',
			},
			tempHp: {
				name: 'tempHp',
				value: 'tempHp',
			},
			stamina: {
				name: 'stamina',
				value: 'stamina',
			},
			resolve: {
				name: 'resolve',
				value: 'resolve',
			},
			heroPoints: {
				name: 'hero points',
				value: 'hero-points',
			},
			focusPoints: {
				name: 'focus points',
				value: 'focus-points',
			},
		},
	},
	gameplayDamageAmount: {
		name: 'amount',
		description: 'The amount of damage to apply. A negative number heals the target.',
	},
	gameplayDamageType: {
		name: 'type',
		description: 'The type of damage to apply.',
	},
	gameplaySetValue: {
		name: 'value',
		description: "The value to update to on the target character's sheet",
	},
	gameplayTargetCharacter: {
		name: 'target-character',
		description: 'What character to update. Defaults to your active character.',
	},
	gameplayTargetChannel: {
		name: 'target-channel',
		description: 'What channel to send the tracker to. Defaults to your current channel.',
	},
	gameSheetStyle: {
		name: 'sheet-style',
		description: 'How much information to display for each character.',
	},
	gameGiveOption: {
		name: 'what-to-give',
		description: 'What resource to give.',
		choices: {
			hp: {
				name: 'hp',
				value: 'hp',
			},
			tempHp: {
				name: 'tempHp',
				value: 'tempHp',
			},
			stamina: {
				name: 'stamina',
				value: 'stamina',
			},
			resolve: {
				name: 'resolve',
				value: 'resolve',
			},
			heroPoints: {
				name: 'hero points',
				value: 'hero-points',
			},
			focusPoints: {
				name: 'focus points',
				value: 'focus-points',
			},
		},
	},
	gameGiveAmount: {
		name: 'amount',
		description: 'How much of the resource to give.',
	},
	gameplayTrackerMode: {
		name: 'tracker-mode',
		description: 'How much information to track for the character.',
		choices: {
			countersOnly: {
				name: 'counters-only',
				value: 'counters_only',
			},
			basicStats: {
				name: 'basic-stats',
				value: 'basic_stats',
			},
			fullSheet: {
				name: 'full-sheet',
				value: 'full_sheet',
			},
		},
	},

	// INIT

	initValue: {
		name: 'value',
		description: 'A value to set your initiative to. Overwrites any other init options.',
	},
	initNote: {
		name: 'note',
		description: 'A note displayed in the initiative tracker. "-" or "none" to remove.',
	},
	template: {
		name: 'template',
		description: 'Optionally apply a template to the added creature.',
		choices: {
			normal: {
				name: 'normal',
				value: 'normal',
			},
			elite: {
				name: 'elite',
				value: 'elite',
			},
			weak: {
				name: 'weak',
				value: 'weak',
			},
		},
	},
	initActor: {
		name: 'name',
		description: 'What to display the NPC/minion as in the initiative order.',
	},
	initCharacter: {
		name: 'character',
		description: 'A character or npc present in the initiative.',
	},
	initCharacterTarget: {
		name: 'target-character',
		description: 'The character being targeted.',
	},
	initCreature: {
		name: 'creature',
		description: 'A creature to add to the initiative.',
	},
	initHideStats: {
		name: 'hide-stats',
		description: 'Whether to hide the stats of the character/creature in the initiative.',
	},
	initCustomStats: {
		name: 'custom-stats',
		description: 'Overrides for the custom stats. In the format "hp=35;ac=20;will=7"',
	},
	initTargetActor: {
		name: 'target-initiative-member',
		description: 'Which member of the initiative to target.',
	},
	initRollChoice: {
		name: 'roll',
		description:
			'What to have that initiative member roll. Choose the initiative member first!',
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
			isGm: {
				name: 'player-is-gm',
				value: 'player-is-gm',
			},
			hideStats: {
				name: 'hide-stats',
				value: 'hide-stats',
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
	conditionName: {
		name: 'name',
		description: 'The name of the condition.',
	},
	modifierType: {
		name: 'type',
		description: 'The optional type (status, item, or circumstance) of the modifier.',
		choices: {
			status: {
				name: 'status',
				value: 'status',
			},
			item: {
				name: 'item',
				value: 'item',
			},
			circumstance: {
				name: 'circumstance',
				value: 'circumstance',
			},
			untyped: {
				name: 'untyped',
				value: 'untyped',
			},
		},
	},
	modifierDescription: {
		name: 'description',
		description: 'A description for the modifier.',
	},
	modifierInitiativeNote: {
		name: 'initiative-note',
		description: 'A note to display in initiative when active.',
	},
	modifierRollAdjustment: {
		name: 'roll-adjustment',
		description: 'The amount to adjust a dice roll. Can be a number or a dice expression.',
	},
	modifierSeverity: {
		name: 'severity',
		description: 'A measure of a modifier\'s effect. Use "[severity]" in the value.',
	},
	modifierTargetTags: {
		name: 'roll-target-tags',
		description:
			'A set of tags for the rolls that this modifier applies to. For example "skill or attack or save"',
	},
	modifierSheetValues: {
		name: 'sheet-values',
		description: 'How to alter the sheet values. For example "maxHp+5;ac=20;will-1"',
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
			rollAdjustment: {
				name: 'roll-adjustment',
				value: 'roll-adjustment',
			},
			rollTargetTags: {
				name: 'roll-target-tags',
				value: 'roll-target-tags',
			},
			sheetValues: {
				name: 'sheet-values',
				value: 'sheet-values',
			},
			severity: {
				name: 'severity',
				value: 'severity',
			},
			note: {
				name: 'initiative-note',
				value: 'initiative-note',
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
	attackChoice: {
		name: 'attack',
		description: 'The attack to roll.',
	},
	rollOverwriteAttack: {
		name: 'overwrite-attack-roll',
		description: 'An alternate attack roll replacing all attack rolls',
	},
	rollOverwriteSave: {
		name: 'overwrite-save-roll',
		description: 'An alternate save roll replacing all save rolls',
	},
	rollOverwriteDamage: {
		name: 'overwrite-damage-roll',
		description: 'An alternate damage roll replacing the FIRST damage roll.',
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
			sendToGm: {
				name: 'send-to-gm',
				value: 'send-to-gm',
				description: 'Only works if in a "game" in this server. Sends the roll to the GM.',
			},
		},
	},
	statBlockSecret: {
		name: 'secret',
		description: 'Whether to send the stat block in a hidden, temporary message.',
		choices: {
			public: {
				name: 'public',
				value: 'public',
				description: 'A public stat block.',
			},
			secret: {
				name: 'secret',
				value: 'secret',
				description: 'A temporary, hidden stat block message viewable only to you.',
			},
		},
	},
	rollModifier: {
		name: 'modifier',
		description: 'A dice expression to modify your roll. (e.g. "+ 1 + 1d4")',
	},
	rollTargetDc: {
		name: 'overwrite-dc',
		description: 'Provide a custom DC to roll attacks against.',
	},
	rollTargetAC: {
		name: 'overwrite-ac',
		description: 'Provide a custom AC to roll the attack against.',
	},
	rollSaveDiceRoll: {
		name: 'overwrite-save-dice-roll',
		description: 'Provide the dice roll to use for any saving throw in the action.',
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

	// ROLL MACROS

	rollMacroName: {
		name: 'name',
		description: 'The name of the roll macro.',
	},
	rollMacroValue: {
		name: 'value',
		description:
			'A mini-roll expression. Must be able to evaluate on its own. Ex. "5" or "d4+[str]"',
	},

	// SETTINGS

	settingsSetOption: {
		name: 'option',
		description: 'The option to update.',
		choices: {
			initTrackerNotifications: {
				name: 'initiative-tracker-notifications',
				value: 'initiative-tracker-notifications',
			},
			inlineRollsDisplay: {
				name: 'inline-rolls-display',
				value: 'inline-rolls-display',
			},
			defaultCompendium: {
				name: 'default-compendium',
				value: 'default-compendium',
			},
		},
	},
	settingsSetValue: {
		name: 'value',
		description: 'The value to set the option to.',
	},

	// COMPENDIUM

	compendiumSearch: {
		name: 'search',
		description: "The name of the thing you're searching for.",
	},
	compendiumSearchChoice: {
		name: 'search',
		description: "The name of the thing you're searching for.",
		choices: {
			archivesOfNeythys: {
				name: 'archives-of-nethys',
				value: 'archives-of-nethys',
			},
			pf2eTools: {
				name: 'pf2eTools',
				value: 'pf2eTools',
			},
		},
	},
};
