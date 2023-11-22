import { refs } from '../../../constants/common-text.js';

export default {
	name: 'help',
	description: 'Get help with commands, permissions, FAQ, etc.',

	faq: {
		name: 'faq',
		value: 'faq',
		description: 'Frequently Asked Questions',
		interactions: {
			embed: {
				title: 'Frequently Asked Questions',
				thumbnail: refs.links.thumbnail,
				addToServer: {
					name: 'How do I add Kobold to a server?',
					value: refs.embedLinks.invite,
				},
				slashCommands: {
					name: 'How do commands work?',
					value:
						"Kobold uses discord's new slash commands. " +
						"To use a slash command, type `/` followed by one of Kobold's commands, " +
						"and then select the command from discord's pop-up. " +
						'Required command options automatically appear for you to enter. ' +
						'Optional command options may require you to choose the option from ' +
						"discord's pop-up or to tap the right arrow from the options.\n\n" +
						"See [Discord's explanation](https://support.discord.com/hc/vi/" +
						'articles/1500000368501-Slash-Commands-FAQ) for more details!',
				},
				commandOptions: {
					name: "Where can I find a list of kobold's commands?",
					value: 'Use the command `/help commands`',
				},
				importWanderersGuideCharacter: {
					name: "How do I import a Wanderer's Guide character?",
					value:
						"go to your character's webpage in Wanderer's Guide " +
						'and copy the webpage URL.\n\n' +
						'Then, start the `/character import-wanderers-guide` command, and enter that URL ' +
						"in the command's url option. It may ask you to authenticate the " +
						'character. If so, follow the link, complete the instructions, ' +
						"and then `/character import-wanderers-guide` your character's url again.",
				},
				importPathbuilderCharacter: {
					name: 'How do I import a Pathbuilder character?',
					value:
						"Open your character's sheet in Pathbuilder, open the menu, and select 'Export Character'. " +
						'Copy the number listed under "Pathbuilder 2e JSON ID."\n\n' +
						'Then, use the `/character import-pathbuilder <json-id>` command, and pasting the copied id ' +
						'into the json-id option.',
				},
				initiative: {
					name: 'How does initiative work?',
					value:
						'To start initiative, use the command `/init start`. ' +
						"An initiative is now running in the current channel, but it doesn't " +
						'have any members yet. \n\nTo join initiative with your active character, ' +
						'use `/init join`. If, instead, you want to add an NPC or bestiary creature to initiative, ' +
						'use `/init add` and optionally select the creature from the pop-up. \n\n',
				},
			},
		},
	},
	about: {
		name: 'about',
		value: 'about',
		description: 'Information about the Kobold bot',
		interactions: {
			embed: {
				title: 'About Kobold',
				thumbnail: refs.links.thumbnail,
				description:
					'Kobold integrates the excellent character management ' +
					"website Wanderer's Guide with discord for play by " +
					'post pathfinder 2E games.\n',
				authorField: {
					name: 'Developed by',
					value: refs.bot.author,
				},
				featuresField: {
					name: 'Features',
					value:
						"Import characters from Wanderer's Guide\n\n" +
						"Roll dice for your character's stats\n\n" +
						'Track characters and NPCs through rounds of initiative' +
						'Create custom, configurable, rollable actions\n\n' +
						'Use flexible modifiers to track bonuses and penalties to dice roll\n\n',
				},
				linksField: {
					name: 'Links',
					value:
						refs.embedLinks.invite +
						'\n' +
						refs.embedLinks.donate +
						'\n' +
						refs.embedLinks.support +
						'\n' +
						refs.embedLinks.source,
				},
			},
		},
	},
	commands: {
		name: 'commands',
		value: 'commands',
		description: 'All commands in Kobold',
		interactions: {
			embed: {
				title: 'Kobold Commands',
				thumbnail: refs.links.thumbnail,
			},
		},
	},
	character: {
		name: 'character',
		value: 'character',
		description: 'Help for the /character command',
		interactions: {
			embed: {
				title: '/character Commands',
				thumbnail: refs.links.thumbnail,
				description:
					'Character commands assist with managing imported characters ' +
					"from Wanderer's guide and Pathbuilder. You can to update your character to " +
					"reflect any changes since you imported it, display your character's sheet, " +
					'or switch between multiple active imported characters. Because ' +
					"wanderer's guide requires OAuth access for a character, import/update " +
					'commands may prompt you to authorize Kobold to read your character.',
			},
		},
	},
	compendium: {
		name: 'compendium',
		value: 'compendium',
		description: 'Help for the /compendium command',
		interactions: {
			embed: {
				title: '/compendium Commands',
				thumbnail: refs.links.thumbnail,
				description:
					'Compendium commands display information about various ' +
					'creatures, items, spells, and other game content.',
			},
		},
	},
	init: {
		name: 'init',
		value: 'init',
		description: 'Help for the /init command',
		interactions: {
			embed: {
				title: '/init Commands',
				thumbnail: refs.links.thumbnail,
				description:
					'Manages initiative in a channel. \n - Create an initiative with /init start.\n' +
					' - Use /init join to join initiative with your active character or /init ' +
					'add to add a minion or NPC to initiative.\n - Begin the initiative with /init ' +
					"next.\n - When an NPC is defeated, remove it with /init remove.\n - When it's " +
					'over, end the initiative with /init end.',
			},
		},
	},
	roll: {
		name: 'roll',
		value: 'roll',
		description: 'Help for the /roll command',
		interactions: {
			embed: {
				title: '/roll Commands',
				thumbnail: refs.links.thumbnail,
				description:
					'Rolls some set of dice. This can either be a simple dice roll unrelated ' +
					'to a character in Kobold, or it can be a skill, save, attack, or ability roll. ' +
					'\n\nKobold uses a dice rolling syntax similar to that of Roll20. Any ' +
					'dice roll command will have a field where any arbitrary dice expression ' +
					'may be included, allowing flexibility for your rolls.',
			},
		},
	},
	modifier: {
		name: 'modifier',
		value: 'modifier',
		description: 'Help for the /modifier command',
		interactions: {
			embed: {
				title: '/modifier Commands',
				thumbnail: refs.links.thumbnail,
				description:
					'Modifiers are ways of applying bonuses or penalties to your sheet or rolls or just ' +
					'straight up changing values on your sheet itself.' +
					'All modifiers can be toggled, and roll modifiers can be conditional based on the type of the roll.' +
					'Sheet modifiers and Roll modifiers are typed (or untyped), but ' +
					'these types DO NOT interact with each other. A +1 circumstance sheet modifier to ' +
					'athletics will stack with a +1 circumstance roll modifier to athletics. Be careful mixing them!',
			},
		},
	},
	attributesAndTags: {
		name: 'attributes-and-tags',
		value: 'attributes-and-tags',
		description: 'Help for character attributes and roll tags',
		interactions: {
			embed: {
				title: 'Character Attributes and Roll Tags',
				thumbnail: refs.links.thumbnail,
				description:
					'Character attributes are numeric values about your character that are usable in any roll. ' +
					'You can add attributes to any roll by simply including the attribute name wrapped in square ' +
					"brackets []. For example, a d20 roll that you're trained in using strength can be rolled with " +
					'`d20 + [trained] + [strength]`. Certain attributes also add tags to your rolls, allowing modifiers ' +
					'to effect them. For example a roll with `[athletics]` would apply the "athletics" tag and the "skill" tag. ' +
					'\n\nBelow are all available attributes:',
				attributes: {
					character: [
						'level',
						'maxHp',
						'tempHp',
						'ac',
						'heroPoints',
						'speed',
						'classDc',
						'perception',
						'maxStamina',
						'stamina',
						'maxResolve',
						'resolve',
					],
					attacks: [
						'arcaneAttack',
						'divineAttack',
						'occultAttack',
						'primalAttack',
						'simpleAttack',
						'martialAttack',
						'advancedAttack',
						'unarmedAttack',
					],
					ability: [
						'strength',
						'dexterity',
						'constitution',
						'intelligence/',
						'wisdom',
						'charisma',
					],
					save: ['fortitude', 'reflex', 'will'],
					skill: [
						'Acrobatics',
						'Arcana',
						'Athletics',
						'Crafting',
						'Deception',
						'Diplomacy',
						'Intimidation',
						'Medicine',
						'Nature',
						'Occultism',
						'Performance',
						'Religion',
						'Society',
						'Stealth',
						'Survival',
						'Thievery',
						"(Any custom skills such as lores as well. E.G. 'Warfare_Lore'. Spaces are replaced with \\_'s)",
					],
					helpers: ['untrained', 'trained', 'expert', 'master', 'legendary'],
				},
				shorthands: {
					str: 'strength',
					dex: 'dexterity',
					con: 'constitution',
					int: 'intelligence',
					wis: 'wisdom',
					cha: 'charisma',
					fort: 'fortitude',
					ref: 'reflex',
					health: 'hp',
					tempHealth: 'tempHp',
					perc: 'perception',
				},
			},
		},
	},
	game: {
		name: 'game',
		value: 'game',
		description: 'help for the /game command.',
		interactions: {
			embed: {
				title: '/game Commands',
				thumbnail: refs.links.thumbnail,
				description:
					'The game commands are used to manage players within a game, allowing a GM to ' +
					'roll dice for their characters. Games are per-server. You can never use or manage ' +
					'a game outside of the server it was created in.\n\n' +
					'Create a game with \n`/game manage [create] [name of the new game]`\n\n' +
					'Have your players join the game using \n`/game manage [join] [name of the created game]`\n\n' +
					'Then roll dice for your players with \n`/game roll [roll type]`!\n\n',
			},
		},
	},
	gameplay: {
		name: 'gameplay',
		value: 'gameplay',
		description: 'help for the /gameplay command.',
		interactions: {
			embed: {
				title: '/gameplay Commands',
				thumbnail: refs.links.thumbnail,
				description:
					'The gameplay commands are used to handle gameplay values for characters and initiative. ' +
					'You can set hp, stamina, resolve, focus points, hero points, etc. using these commands. \n\n',
			},
		},
	},
	makingACustomAction: {
		name: 'action-creation-walkthrough',
		value: 'action-creation-walkthrough',
		description: 'Help for creating a custom action',
		interactions: {
			embed: {
				title: 'Creating a Custom Action',
				thumbnail: refs.links.thumbnail,
				produceFlame:
					'Lilac Sootscale, a level 7 kobold sorceress, wants to make her cantrip Produce Flame as a custom action. \n\n' +
					'She starts off by creating the action itself. The action\'s name is "Produce Flame". It\'s a cantrip, so ' +
					'we want to turn on automatic heightening. It costs 2 actions to cast. She adds some tags to ' +
					'indicate that the spell is a fire cantrip that comes from her bloodline. ' +
					'So, she creates it with the following command:\n\n' +
					'`/action create name:Produce Flame action-type:spell actions:two auto-heighten:True tags:fire,cantrip,bloodline`\n\n' +
					'Next, she wants to remember the details of the spell without looking it up. She adds a text field to always display ' +
					'the spell\'s information. Every stage needs a name so it can be edited/removed later, so she calls it "Details"\n\n' +
					'`/action-stage add-text action:Produce Flame roll-name:Details default-text:Range 30 feet; Targets 1 creature`\n\n' +
					'Now she needs to have the attack roll to hit! Lilac uses her primal spell attack roll to check for a hit, but that value \n' +
					"isn't stored in her attributes by kobold. So first, she'll add a simple roll macro that she can use for her primal attacks " +
					'in the future. This roll macro references her expert proficiency and charisma modifier:\n\n' +
					'`/roll-macro create name:primalSpellAttack value:[expert] + [cha]`\n\n' +
					"She uses that roll macro for her attack roll, having it target an enemy's AC\n\n" +
					'`/action-stage add-attack action:Produce Flame roll-name:Attack dice-roll:d20+[primalSpellAttack] target-ac-save-or-skill:AC`\n\n' +
					"Next, she needs damage for the Produce Flame roll. Produce Flame's uses basic damage multiplied on criticals, so we'll " +
					"add the damage using a basic-damage stage. However, Produce Flame's damage dice are heightened, so we need our roll to reference" +
					"the spell's level. Luckily, that value is provided to all rolls as [spellLevel] [abilityLevel] or just [_level]\n\n" +
					'`/action-stage add-basic-damage action:Produce Flame roll-name:Damage basic-damage-dice-roll:[spellLevel]d4 + [cha]`\n\n' +
					"Finally, Produce Flame has a critical hit effect that applies persistent damage based on the spell level. We'll add this " +
					"by using a text stage's critical success field and inlining spellLevel to print the number of dice\n\n" +
					'`/action-stage add-text action:Produce Flame roll-name:Critical Effect critical-success-text:The target takes {inlineOne}d4 persistent fire damage.`\n\n' +
					'Now, Lilac can roll the action by typing `/roll action action:Produce Flame`' +
					' and the bot will roll the attack and damage for her!',
				fireball:
					'Lilac Sootscale, a level 7 kobold sorceress, wants to make her spell Fireball as a custom action. \n\n' +
					'She starts off by creating the action itself. The action\'s name is "Fireball". It\'s a first level spell, so ' +
					"we won't turn on automatic heightening, but we will give it a base level of 3. It costs 2 actions to cast. She adds some tags to " +
					'indicate that the spell is an instantaneous fire spell from her bloodline (so she can add her modifiers ' +
					'for dangerous sorcery and her blood magic to the damage!). So, she creates it with the following command:\n\n' +
					'`/action create name:Fireball action-type:spell actions:two base-level:3 tags:fire,instantaneous,bloodline`\n\n' +
					'Next, she wants to remember the details of the spell without looking it up. She adds a text field to always display ' +
					'the spell\'s information. Every stage needs a name so it can be edited/removed later, so she calls it "Details"\n\n' +
					'`/action-stage add-text action:Fireball roll-name:Details default-text:Range 500 feet; Area 20-foot burst`\n\n' +
					'The effects of Fireball depend on whether the target succeeds or fails a will save against her Primal Spell DC. ' +
					'So Lilac adds a save stage to the action.\n\n' +
					'`/action-stage add-save action:Fireball roll-name:Save save-roll-type:Reflex save-dc-type:Primal Spell DC`\n\n' +
					"Finally, fireball's damage is basic damage based on the save, so she adds a basic damage stage to the action. We reference" +
					" the spell's level with the action's attribute [spellLevel], as fireball rolls 2d6 per spell level.\n\n" +
					'`/action-stage add-basic-damage action:Fireball roll-name:Damage basic-damage-dice-roll:(2*[spellLevel])d6`\n\n' +
					'Now, Lilac can roll Fireball! She heightens the spell to level 4. \n\n' +
					'`/roll action action:Fireball heighten:4`',
				phantomPain:
					'Portia, a level 7 anadi bard, wants to make the spell Phantom Pain as a custom action. \n\n' +
					'She starts off by creating the action itself. The action\'s name is "Phantom Pain". It\'s a first level spell, so ' +
					"we won't turn on automatic heightening, but we will give it a base level of 1. It costs 2 actions to cast. She adds some tags to " +
					'indicate that the spell is nonlethal mental spell. ' +
					'So, she creates it with the following command:\n\n' +
					'`/action create name:Phantom Pain action-type:spell actions:two base-level:1 tags:mental, nonlethal`\n\n' +
					'Next, she wants to remember the details of the spell without looking it up. She adds a text field to always display ' +
					'the spell\'s information. Every stage needs a name so it can be edited/removed later, so she calls it "Details"\n\n' +
					'`/action-stage add-text action:Phantom Pain roll-name:Details default-text:Range 30 feet; Targets 1 creature`\n\n' +
					'The effects of Phantom Pain depend on whether the target succeeds or fails a will save against her occult spell DC. ' +
					'So Portia adds a save stage to the action.\n\n' +
					'`/action-stage add-save action:Phantom Pain roll-name:Save save-roll-type:d20+[will] save-dc-type:OccultDc`\n\n' +
					"Now, we need to roll damage for Phantom Pain. The damage isn't basic save damage, so we need to add " +
					'an advanced damage stage that can specify the damage based on the save result. We make sure to adjust the damage dice based ' +
					'on the spell level. in this case, 2 dice per spell level, so ([spellLevel](2))d4\n\n' +
					'`/action-stage add-advanced-damage action:Phantom Pain roll-name:Damage success-dice-roll:' +
					'([spellLevel]*2)d4 failure-dice-roll:([spellLevel](2))d4 critical-failure-dice-roll:([spellLevel](2))d4`\n\n' +
					'Although Phantom Pain only does its flat damage on anything from success to failure, it has many other effects. ' +
					'Portia clarifies these effects with an additional text stage.\n\n' +
					'`/action-stage add-text action:Phantom Pain roll-name:Effects failure-text:The target takes {inlineOne} ' +
					'persistent damage and becomes sickened 1. If they recover from sickened, the persistent damage ends. ' +
					'critical-failure-text:The target takes {inlineOne} persistent damage and becomes sickened 2. ' +
					'If they recover from sickened, the persistent damage ends.`\n\n' +
					'Now, Portia can roll Phantom Pain. She heightens the spell to level 2. \n\n' +
					'`/roll action action:Phantom Pain heighten:2`',
				gunslingerPairedShots:
					'Amethyst, a level 5 kobold pistolero, gunslinger wants to make a custom action for her Paired Shots ability. ' +
					'She starts off by creating the action itself. The action\'s name is "Paired Shots". It\'s an attack rather than a spell.\n\n' +
					'`/action create name:Paired Shots action-type:attack actions:two`\n\n' +
					"A gunslinger's Paired Shots ability allows her to make two attacks with her pistol. So, we'll want to make a macro for her attack " +
					'roll to more easily update this action in the future. Amethyst uses two Slide Pistols that are each +1 striking thanks to her ' +
					'blazons of shared power.\n\n' +
					'`/roll-macro create name:slidePistolToHit value:[master]+[dex]+1`\n\n' +
					'Now, she can add a stage to the action that will roll the attack for her. She sets the attack roll to use the macro she just created.' +
					"She selects AC as the attack's target DC.\n\n" +
					'`/action-stage add-attack action: Paired Shots roll-name: First Strike To Hit dice-roll: d20 + [slidePistolToHit] target-ac-save-or-skill: AC`\n\n' +
					'She plans to add stronger striking runes to her weapons in the future, so before creating her damage roll, ' +
					'she sets up a macro for her pistols. She can easily update her damage in the future by editing the macros.' +
					' damage and critical damage.\n\n' +
					'`/roll-macro create name:slidePistolDamage value:2d6`\n\n' +
					'`/roll-macro create name:slidePistolCritDamage value:2d10`\n\n' +
					'With those macros, she creates the advanced damage roll, specifying the success damage and the critical success damage. ' +
					' Her weapon has deadly d10 for critical hits, so we use an advanced damage roll.\n\n' +
					'`/action-stage add-advanced-damage action:Paired Shots roll-name:First Strike Damage success-dice-roll:[slidePistolDamage] ' +
					'critical-success-dice-roll:[slidePistolCritDamage]`\n\n' +
					'Now, she adds another attack stage and damage stage for the second strike.\n\n' +
					'`/action-stage add-attack action:Paired Shots roll-name: Second Strike To Hit dice-roll: d20 + [slidePistolToHit] target-ac-save-or-skill: AC`\n\n' +
					'`/action-stage add-advanced-damage action:Paired Shots roll-name:Second Strike Damage success-dice-roll:[slidePistolDamage] critical-success-dice-roll:[slidePistolCritDamage]`\n\n' +
					'With both attack rolls and damage rolls, the action is ready! Amethyst can roll the action using this command:\n\n' +
					'`/roll action action:Paired Shots`',
				battleMedicine:
					'Anatase Lightclaw, a level 2 kobold monk, wants to make a custom action for her Battle Medicine skill action at the trained DC of 15. ' +
					'She starts off by creating the action itself. The action\'s name will be "Battle Medicine (DC 15)". It\'s an "other" action that' +
					' takes one action. Battle medicine has a different DC and heals differently for each ' +
					'new DC option that you unlock as your proficiency goes up. I recommend making a new action for each.\n\n' +
					'`/action create name:Battle Medicine (DC 15) action-type:other actions:one tags:medicine, skill`\n\n' +
					'The Battle Medicine action allows Anatase to heal an ally in combat as if she were using the Treat Wounds medicine action. ' +
					'This requires her to make a medicine roll against a DC that she can choose medicine. She chooses this action to be for the trained DC (15). ' +
					'She adds a stage to the action that will roll the medicine check for her. This is a "skill-challenge" action stage, because it\'s ' +
					'rolling against her own value.\n\n' +
					'`/action-stage add-skill-challenge action: Battle Medicine roll-name: Medicine Check dice-roll: d20+[medicine] target-ac-save-or-skill: 15`\n\n' +
					'Now we use an advanced damage stage to represent the healing. We toggle the damage stage to heal instead of doing damage.\n\n' +
					'`/action-stage add-advanced-damage action:Battle Medicine roll-name:Healing critical-success-dice-roll:4d8 success-dice-roll:2d8 heal-instead-of-damage:True`\n\n' +
					'However, on critically failing the roll, the target instead takes 1d8 damage! We use a new advanced damage stage to represent this.\n\n' +
					'`/action-stage add-advanced-damage action:Battle Medicine roll-name:Critical Fail Damage! critical-failure-dice-roll:1d8`\n\n' +
					'The action is ready! Anatase can roll the action using this command:\n\n' +
					'`/roll action action:Battle Medicine`\n\n' +
					"Once Anatase reaches expert in medicine, she'll make a second action with a DC of 20 and hp recovery of 2d8+10, etc. to choose between.",
			},
		},
	},
	action: {
		name: 'action',
		value: 'action',
		description: 'Help for the /action command',
		interactions: {
			embed: {
				title: '/action Commands',
				thumbnail: refs.links.thumbnail,
				description:
					"The action commands are used to create/edit/remove custom actions, allowing a player to set up prebuilt rolls using the character's stats.\n\n" +
					'Create a custom action with \n`/action create type:[spell, attack, other] name:[name of the new action]`\n\n' +
					'Then add rolls to the action using the commands detailed in `/help action-stage`\n\n' +
					'Use the help command `/help action-creation-walkthrough` for examples of how to make custom actions from start to finish!\n\n',
			},
		},
	},
	actionStage: {
		name: 'action-stage',
		value: 'action-stage',
		description: 'Help for the /action-stage command',
		interactions: {
			embed: {
				title: '/action-stage Commands',
				thumbnail: refs.links.thumbnail,
				description:
					'Action stages are different parts of a custom action. You can add as many as you want to a custom action,' +
					' and they will be executed in the order they are added. Different types of stages do different things. ' +
					'There are two main types, targeting stages and result stages \n\n' +
					'Use the help command `/help action-creation-walkthrough` for examples of how to make custom actions from start to finish!\n\n' +
					'**Targeting Stages** are used to target a specific player or monster. They are used to determine whether an ' +
					'action succeeds or fails for the following result stages. Any success/failure/critical result from a ' +
					'targeting stage carries through all result stages until another targeting stage is reached. ' +
					'There are two types of targeting stages.\n\n' +
					'An **Attack** action stage represents an attack roll. These allow you to target enemy DCs, such as AC or an athletics DC.\n\n' +
					'A **Skill Challenge** action stage represents a roll against your own DCs. This can also be a number, such as "20" for a Treat Wounds action.\n\n' +
					'A **Save** action stage forces the target to make a saving throw. You can have them target a certain DC of yours, ' +
					'and provide the type of roll they must make to meet that DC\n\n' +
					'**Result Stages** are used to display the results or details of an action. There are three types of result stages.\n\n' +
					'A **Text** action stage is used to display a message to the user. This can be information about an action, ' +
					'or the results a saving throw or attack. Text stages give you the option for a message to display no matter what, ' +
					'as well as messages to conditionally display on a success, failure, or critical success/failure. \n\n' +
					'A **Basic Damage** action stage is used to display the most common damage results for attacks or basic saving throws. \n' +
					'After an __attack__, the basic damage stage will roll damage if the attack hits, double damage if it critically hits, ' +
					'or nothing on any failure. \n' +
					'After a __saving throw__, the basic damage stage rolls damage on a fail, double damage on a critical fail, half damage ' +
					'on a success, and nothing on a critical success.\n\n' +
					'An **Advanced Damage** action stage is used to display more complex damage results. It allows you to specify a separate rolls ' +
					'for each of the four possible results of a targeting stage. Critical Success, success, failure, and critical failure\n\n' +
					'Result stages do not require targeting stages. A __basic damage__ stage will roll regular hit damage if there is no targeting stage before it, ' +
					'or if the targeting stage was not given a DC to check against. An __advanced damage__ or __text__ stage will always display all ' +
					'possible results if there is no targeting stage before it, or if the targeting result is inconclusive.',
			},
		},
	},
	rollMacro: {
		name: 'roll-macro',
		value: 'roll-macro',
		description: 'Help for the /roll-macro command',
		interactions: {
			embed: {
				title: '/roll-macro Commands',
				thumbnail: refs.links.thumbnail,
				description:
					'Roll macros store dice rolls that can be accessed in any other roll in [] brackets.',
			},
		},
	},
	settings: {
		name: 'settings',
		value: 'settings',
		description: 'Help for the /settings command',
		interactions: {
			embed: {
				title: '/settings Commands',
				description: 'Settings commands configure kobold to your liking!',
			},
		},
	},
};
