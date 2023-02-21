import { refs } from '../common.js';

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
					value: refs.links.embed.invite,
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
				importCharacter: {
					name: "How do I import a wanderer's guide character?",
					value:
						"go to your character's webpage in wanderer's guide " +
						'and copy the webpage URL.\n\n' +
						'Then, start the `/import` command, and enter that URL ' +
						"in the command's url option. It may ask you to authenticate the " +
						'character. If so, follow the link, complete the instructions, ' +
						"and then `/import` your character's url again.",
				},
				initiative: {
					name: 'How does initiative work?',
					value:
						'To start initiative, use the command `/init start`. ' +
						"An initiative is now running in the current channel, but it doesn't " +
						'have any members yet. \n\nTo join initiative with your active character, ' +
						'use `/init join`. If, instead, you want to join initiative with an NPC' +
						'use `/init add`. You will be required to enter a name, and have options to' +
						'either choose an initiative value to have them join on, or to provide a ' +
						'dice expression for them to roll for their initiative value.',
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
						'Track characters and NPCs through rounds of initiative',
				},
				linksField: {
					name: 'Links',
					value:
						refs.links.embed.invite +
						'\n' +
						refs.links.embed.donate +
						'\n' +
						refs.links.embed.support +
						'\n' +
						refs.links.embed.source,
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
					'Character commands all assist with managing imported characters' +
					"from Wanderer's guide. They allow you to update your character to" +
					"reflect changes since you imported it, to display your character's sheet, " +
					'and to switch between multiple active imported characters. Because ' +
					"wanderer's guide requires OAuth access for a character, import/update" +
					'commands may prompt you to authorize Kobold to read your character.',
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
					'Modifiers are conditional bonuses or penalties that apply to certain dice rolls. ' +
					'Which dice rolls are affected is based on a system of "tags." For example, every attack roll has ' +
					'the `attack` tag and every skill roll has the `skill` tag. A full list of tags are available under ' +
					'`/help attributes-and-tags`. \n\nModifiers can be toggled active or inactive. When inactive, a ' +
					'modifier will never apply to a roll, even if it applies to the given tags.\n\n\n' +
					'**How to target rolls with target-tags**\n\n' +
					'\t**or**\n\n' +
					'`or` means you need EITHER tag in the roll.\n\n' +
					'`attack or save` means that the roll can either be an attack roll OR a save roll\n\n\n' +
					'\t**and**\n\n' +
					'`and` means you needs BOTH tags in the roll.\n\n' +
					"`attack and save` means the roll must be an attack roll AND a save roll, which doesn't happen!!\n\n" +
					'`skill and intimidation` would be true on any intimidation roll, because intimidation also has the skill tag!\n\n' +
					'\t**not**\n\n' +
					'`not` means that the roll applies to things that are not that tag \n\n' +
					'`skill and not strength` applies to skill rolls that are NOT strength skills\n\n\n' +
					'\t**Parentheses**\n\n' +
					'Parentheses group tags. () \n\n' +
					'`attack and (skill or dexterity)` requires attack and for the group to be valid! ' +
					'So BOTH attack and EITHER skill or dexterity must be in the roll\n\n\n' +
					'**Advanced**\n\n' +
					'To learn how to build target tags ' +
					'you can also reference [this link](https://github.com/joewalnes/filtrex), although its fairly technical.', //+
				// '`__hp < 50 and damage` - Damage, but only when your current health is below 50 (Yes, you can use ' +
				// 'attributes in target tag expressions if you prefix them with "__"!)\n' +
				// '`attack` - An attack roll! easy as that.',
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
};
