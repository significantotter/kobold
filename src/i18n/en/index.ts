import type { BaseTranslation } from '../i18n-types';

const links = {
	thumbnail: 'https://i.imgur.com/cVOfw8P.png',
	docs: 'https://top.gg/',
	donate: 'https://ko-fi.com/significantotter',
	invite: 'https://discord.com/oauth2/authorize?client_id=909138081163137094&scope=bot&permissions=532643576896',
	source: 'https://github.com/significantotter/kobold',
	support: 'https://discord.gg/6bS2GM59uj',
	template: 'https://github.com/KevinNovak/Discord-Bot-TypeScript-Template',
	vote: 'https://top.gg/',
};
const bot = {
	name: 'Kobold',
	author: 'SignificantOtter#3403',
};

let refs = {
	bot: { ...bot },
	colors: {
		default: '#0099ff',
		success: '#00ff83',
		warning: '#ffcc66',
		error: '#ff4a4a',
	},
	links: {
		...links,
		embed: {
			donate: `[Support Kobold's development through ko-fi](${links.donate})`,
			invite: `[Invite Kobold to a Discord Server](${links.invite})`,
			source: `[Follow Kobold's development on Github](${links.source})`,
			support: `[Join Kobold's Support Server on Discord](${links.support})`,
			template: `[Built with Kevin Novak's Discord Bot TypeScript Template](${links.template})`,
			vote: `[Vote for Kobold!](${links.vote})`,
			wanderersGuide: `[Wanderer's Guide](https://wanderersguide.app)`,
		},
	},
};

const en: BaseTranslation = {
	terms: {
		perception: 'Perception',
	},
	sharedInteractions: {
		choiceRegistered: 'You chose {choice}.',
	},
	commands: {
		admin: {
			name: 'admin',
			description: 'administration tools',
		},
		help: {
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
		},
		character: {
			// MAIN COMMAND INFO
			name: 'character',
			description: 'Character management',

			// SHARED INTERACTIONS
			interactions: {
				noActiveCharacter: `Yip! You don't have any active characters! Use /import to import one.`,

				authenticationRequest:
					`Yip! Before you can {action} a character, you need to authenticate it. ` +
					`Give me permission to read your wanderer's guide character by following the link ` +
					`below. Then, /character {action} your character again!`,
				expiredToken:
					`Yip! It's been a while since I last authenticated your character, so our ` +
					`authentication expired. Please give me permission to read your wanderer's guide ` +
					`character again by following the link below`,
				authenticationLink: `Yip! Please follow  [this link]({wgBaseUrl}?characterId={charId}) to give me access to your character!`,
				tooManyWGRequests: `Yip! Wanderer's Guide told me I'm being pesky and sending too many requests! Try again in a moment.`,
			},

			// SUBCOMMANDS
			import: {
				name: 'import',
				options: '[url]',
				usage: "_[url]_: the url of your character sheet from wanderer's guide",
				description: "Imports a Wanderer's Guide Character",
				expandedDescription:
					'Imports a character from ' +
					'the provided url. If the url is accurate, Kobold will make sure it ' +
					"has authorization to read your character from Wanderer's Guide, and " +
					'then import that character. Otherwise, a link will be provided for you ' +
					"to grant kobold authorization.\n\n If you're unable to find the character's " +
					"url, you can alternately just paste their Wanderer's Guide character id " +
					'into the url field.',
				interactions: {
					invalidUrl:
						`Yip! I couldn't find the character at the url '{url}'. Check ` +
						`and make sure you copied it over correctly! Or just paste ` +
						`in the character's id value instead.`,
					characterAlreadyExists:
						`Yip! {characterName} is already in the system!` +
						` Did you mean to /update?`,
					success: `Yip! I've successfully imported {characterName}!`,
				},
			},
			list: {
				name: 'list',
				description: 'lists all active characters',
				expandedDescription:
					'Displays a list of all characters imported ' +
					'into Kobold. You can check the name of each character and a quick summary ' +
					"of that character's information.",
				interactions: {
					noCharacters: `Yip! You don't have any characters yet! Use /import to import some!`,
					characterListEmbed: {
						title: 'Characters',
						characterFieldName: '{characterName}{activeText?}{serverDefaultText?}',
						characterFieldValue: 'Level {level} {heritage} {ancestry} {classes}',
					},
				},
			},
			remove: {
				name: 'remove',
				description: 'removes an already imported character',
				expandedDescription:
					'Attempts to remove your currently active character. ' +
					"This has no effect on your character in Wanderer's Guide, Kobold simply " +
					'forgets about it. \n\nThe command will prompt you if you really wish to remove ' +
					'your character. If you do, you can still import that character back to ' +
					'Kobold in the future.',
				interactions: {
					removeConfirmation: {
						text: `Are you sure you want to remove {characterName}?`,
						removeButton: 'REMOVE',
						cancelButton: 'CANCEL',
						expired: 'Yip! Character removal request expired.',
					},
					success: `Yip! I've successfully removed {characterName}! You can import them again at any time.`,
					cancelled: `Yip! Canceled the request to remove {characterName}!`,
				},
			},
			setActive: {
				name: 'set-active',
				options: '[name]',
				usage: '_[name]_: the name of the character in Kobold to set active',
				description: 'sets a character as the active character',
				expandedDescription:
					'Sets the character matching the provided name ' +
					'as your active character. Your active character is the one used for ' +
					'commands like /character sheet, /roll, /init, or /character update.',
				interactions: {
					success: 'Yip! {characterName} is now your active character!',
					notFound:
						"Yip! I couldn't find a character matching that name! " +
						"Check what characters you've imported using /character list",
				},
			},
			setServerDefault: {
				name: 'set-server-default',
				options: '[name]',
				usage: '_[name]_: the name of the character in Kobold to set as the server default',
				description: 'sets a character as the default character for the server',
				expandedDescription:
					'Sets the character matching the provided name ' +
					'as the default character used for commands in this server. This applies to ' +
					'commands like /character sheet, /roll, /init, or /character update. Your server default ' +
					'overrides your active character',
				noneOption: '(None)',
				interactions: {
					success: 'Yip! {characterName} is now your default character on this server!',
					removed:
						'Yip! I removed your default character for this server. This server will ' +
						'now use your active character for commands again.',
					notFound:
						"Yip! I couldn't find a character matching that name! " +
						"Check what characters you've imported using /character list",
				},
			},
			sheet: {
				name: 'sheet',
				description: "displays the active character's sheet",
				expandedDescription:
					'Displays a character sheet for your currently active ' +
					"character. The displayed stats are provided by wanderer's guide. These " +
					'stats are used for any dice commands relating to the character.',
				interactions: {
					sheet: {
						coreDataField: {
							name: 'Level {level} {heritage} {ancestry} {classes}\n',
							maxHpField: 'Max HP `{health}`',
							resolveField: 'Max Resolve `{resolve}`',
							staminaField: 'Max Stamina `{stamina}`',
							acField: 'AC `{armorClass}`',
							perceptionField:
								'Perception `{perceptionModifier}` (DC {perceptionDC})',
							classDcField: '{classes} DC `{classDC}`',
							speedField: 'Speed `{speed}`\n',
							backgroundField: 'Background: {background}',
						},
						abilitiesField: {
							name: 'Abilities',
						},
						savesField: {
							name: 'Saves',
						},
						skillsField: {
							name: 'Skills',
						},
					},
				},
			},
			update: {
				name: 'update',
				description: 'updates an already imported character',
				expandedDescription:
					'Updates your currently active ' +
					"character with any new information from Wanderer's guide. If some " +
					"time has passed since you authorized kobold to read that character's " +
					'information, you may be asked to authenticate again.',
				interactions: {
					success: `Yip! I've successfully updated {characterName}!`,
				},
			},
		},
		init: {
			name: 'init',
			description: 'Initiative Tracking',
			interactions: {
				noActiveCharacter: "Yip! You don't have any active characters!",
			},

			// SUBCOMMANDS
			start: {
				name: 'start',
				description: 'Start initiative in the current channel.',
				expandedDescription:
					'Starts initiative in the current channel. Only one initiative can ' +
					'exist in per channel at a time. The player who creates the initiative is' +
					'marked as the GM, and can change names, add, and remove any character ' +
					'present in the initiative, not just their own.',
				interactions: {
					notServerChannelError:
						'Yip! You can only start initiative in a normal server channel.',
					initExistsError:
						"Yip! There's already an initiative in this " +
						'channel. End it before you start a new one!',
					otherError: 'Yip! Something when wrong when starting your initiative!',
				},
			},
			show: {
				name: 'show',
				description: `Displays the current initiative order`,
			},
			next: {
				name: 'next',
				description: `Moves to the next participant in the initiative order`,
			},
			prev: {
				name: 'prev',
				description: `Moves to the previous participant in the initiative order`,
			},
			jumpTo: {
				name: 'jump-to',
				options: '[character]',
				usage: '_[character]_: The name of a character in the initiative order.',
				description: `Jumps to a specific participant in the initiative order`,
			},
			join: {
				name: 'join',
				options: '[*skill*] [*dice*] [*value*]',
				usage:
					'_[*skill*] optional_: The name of the skill ("perception") to use to join initiative.\n' +
					'_[*dice*] optional_: The dice expression ("1d20+5") to use to join initiative.\n' +
					'_[*value*] optional_: The static value ("15") to use to join initiative.',
				description:
					'Joins initiative with your active character. ' +
					'Defaults to rolling perception.',
				expandedDescription:
					'Joins initiative with your active character. If no options are provided, ' +
					'perception is rolled for the initiative value. If multiple options are provided, only ' +
					'one will actually work. The only exception is skill + dice expression, where the ' +
					'dice expression (like "1d4") will be added onto the skill',
				interactions: {
					characterAlreadyInInit: 'Yip! {characterName} is already in this initiative!',
					joinedEmbed: {
						title: '{characterName}  joined Initiative!',
						setDescription: 'Initiative: {initValue}',
						rollDescription: 'rolled initiative!',
						roundField: {
							name: '\u200B',
							value: 'Initiative Round {currentRound}',
						},
					},
				},
			},
			add: {
				name: 'add',
				options: '[name] [*dice*] [*value*]',
				usage:
					'_[name]_: The name of the skill ("perception") to use to join initiative.\n' +
					'_[*dice*] optional_: The dice expression ("1d20+5") to use to join initiative.\n' +
					'_[*value*] optional_: The static value ("15") to use to join initiative.',
				description: `Adds an NPC or minion to initiative`,
				expandedDescription:
					'Adds a minion with the provided name to the initiative. If no options are provided, ' +
					'a flat d20 is rolled for the initiative value. If both dice and a value are provided, ' +
					'only the flat value will actually work. This character is controlled by the player ' +
					'who added it to the initiative.\n\nNote, names in initiative are unique, adding a ' +
					'duplicate name will cause a quantifier like -1 to be added to the name. e.g. Goblin-1. ' +
					'if the name Goblin already exists.',
				interactions: {
					joinedEmbed: {
						rolledTitle: '{actorName} rolled initiative!',
						joinedTitle: '{actorName} joined initiative!',
						description: 'Initiative: {finalInitiative}',
						roundField: {
							name: '\u200B',
							value: `[Initiative Round {currentRound}]({url})`,
						},
					},
				},
			},
			set: {
				name: 'set',
				options: '[name] [option] [value]',
				usage:
					'_[name]_: The name of a character in the initiative.\n' +
					'_[option]_: The property of the character to change (just for the current ' +
					'initiative!) This can be "initiative" for the initiative value, or "name" for ' +
					"the character's display name while in the initiative.\n" +
					'_[value]_: The value to set the property to.',
				description: `Sets certain properties of your character for initiative`,
				expandedDescription:
					'Sets either the initiative value or current name of the ' +
					'matching character in the initiative order. Any name changes are only reflected ' +
					"within the initiative. They don't effect the imported character elsewhere.",
				interactions: {
					invalidOptionError: 'Yip! Please send a valid option to update.',
					emptyNameError: "Yip! You can't use an empty name!",
					nameExistsError:
						'Yip! A character with that name is already in the initiative.',
					initNotNumberError: 'Yip! You can only update initiative with a number.',
					successEmbed: {
						title: 'Yip! {actorName} had their {fieldToChange} set to {newFieldValue}.',
					},
				},
			},
			remove: {
				name: 'remove',
				options: '[name]',
				usage: '_[name]_: The name of a character in the initiative.',
				description: 'Removes a character from initiative.',
				expandedDescription:
					'Removes the character that matches the given name from initiative',
				interactions: {
					deletedEmbed: {
						title: 'Yip! {actorName} was removed from initiative.',
					},
				},
			},
			end: {
				name: 'end',
				description: 'Ends the initiative in the current channel.',
				interactions: {
					confirmation: {
						text: 'Are you sure you want to end the initiative?',
						expired: 'Yip! The request to end the initiative expired.',
						confirmButton: 'end',
						cancelButton: 'cancel',
					},
					cancel: 'Yip! Canceled the request to end the initiative!',
					success: 'Yip! Ended the initiative!',
					error: 'Yip! Something went wrong!',
				},
			},
		},
		modifier: {
			name: 'modifier',
			description: 'Toggleable values to modify specified dice rolls.',

			interactions: {
				notFound: "Yip! I couldn't find a modifier with that name.",
				detailHeader: '{modifierName}{modifierIsActive}',
				detailBody:
					'{modifierDescriptionText}\nType: `{modifierType}`\nValue: `{modifierValue}`\nApplies to: `{modifierTargetTags}`',
			},
			list: {
				name: 'list',
				description: 'Lists all modifiers available to your active character.',
			},
			detail: {
				name: 'detail',
				description: 'Describes a modifier available to your active character.',
			},
			toggle: {
				name: 'toggle',
				description:
					'Toggles whether a modifier is currently applying to your active character.',
				interactions: {
					success:
						'Yip! {characterName} had their modifier {modifierName} set to {activeSetting}.',
					active: 'active',
					inactive: 'inactive',
				},
			},
			update: {
				name: 'update',
				description: 'Updates a modifier for your active character.',
				interactions: {
					invalidOptionError: 'Yip! Please send a valid option to update.',
					emptyNameError: "Yip! You can't use an empty name!",
					nameExistsError: 'Yip! A modifier with that name already exists.',
					valueNotNumberError: 'Yip! You can only update a modifier value with a number.',
					successEmbed: {
						title: "Yip! {characterName} had their modifier {modifierName}'s {fieldToChange} set to {newFieldValue}.",
					},
				},
			},
			create: {
				name: 'create',
				description: 'Creates a modifier for the active character.',
				interactions: {
					created: 'Yip! I created the modifier {modifierName} for {characterName}.',
					alreadyExists:
						'Yip! A modifier named {modifierName} already exists for {characterName}.',
					invalidTags:
						"Yip! I didn't understand the target tag expression you provided. Tags can be" +
						' any expression in a format like "attack or skill". ' +
						'See [this link](https://github.com/joewalnes/filtrex) for more details.',
				},
			},
			remove: {
				name: 'remove',
				description: 'Removes a modifier for the active character.',

				interactions: {
					removeConfirmation: {
						text: `Are you sure you want to remove the modifier {modifierName}?`,
						removeButton: 'REMOVE',
						cancelButton: 'CANCEL',
						expired: 'Yip! Modifier removal request expired.',
					},
					cancel: 'Yip! Canceled the request to remove the modifier!',
					success: 'Yip! I removed the modifier {modifierName}.',
				},
			},
			export: {
				name: 'export',
				description:
					'Exports a chunk of modifier data for you to later import on another character.',
				interactions: {
					success:
						"Yip! I've saved {characterName}'s modifiers to [this PasteBin link]({pasteBinLink})",
				},
			},
			import: {
				name: 'import',
				description: 'Imports an array of modifier data to a character from PasteBin.',
				expandedDescription:
					'Imports an array of modifier data to a character from PasteBin. Use ' +
					'exported data from another character. Only try to modify it if you know how to work with JSON!',
				interactions: {
					failedParsing:
						"Yip! I can't figure out how to read that! Try exporting another modifier to check and make " +
						"sure you're formatting it right!",
					badUrl: "Yip! I don't understand that Url! Copy the pastebin url for the pasted modifiers directly into the Url field.",
					imported: 'Yip! I successfully imported those modifiers to {characterName}.',
				},
			},
		},
		roll: {
			name: 'roll',
			description: 'Roll Dice',
			interactions: {
				noActiveCharacter: "Yip! You don't have any active characters!",
				rolledDice: 'rolled {diceType}',
			},

			dice: {
				name: 'dice',
				options: '[dice] [*note*]',
				usage:
					'_[dice]_: The dice expression to roll ("1d20 - 1d4 + 3). Uses a ' +
					'similar syntax to Roll20.\n' +
					'_[*note*] optional_: A note to add to the end of the dice roll.',
				description: `Rolls some dice.`,
				interactions: {
					rolledDice: 'rolled some dice!',
				},
			},
			skill: {
				name: 'skill',
				options: '[skill] [*dice*] [*note*]',
				usage:
					'_[skill]_: The name of the skill to roll.\n' +
					'_[*dice*] optional_: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
					'of the skill roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
					'_[*note*] optional_: A note to add to the end of the dice roll.',
				description: `rolls a skill for your active character`,
			},
			perception: {
				name: 'perception',
				options: '[*dice*] [*note*]',
				usage:
					'_[*dice*] optional_: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
					'of the perception roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
					'_[*note*] optional_: A note to add to the end of the dice roll.',
				description: `rolls perception for your active character`,
			},
			save: {
				name: 'save',
				options: '[save] [*dice*] [*note*]',
				usage:
					'_[save]_: The name of the saving throw to roll.\n' +
					'_[*dice*] optional_: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
					'of the save roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
					'_[*note*] optional_: A note to add to the end of the dice roll.',
				description: `rolls a saving throw for your active character`,
			},
			ability: {
				name: 'ability',
				options: '[ability] [*dice*] [*note*]',
				usage:
					'_[ability]_: The name of the ability to roll.\n' +
					'_[*dice*] optional_: A dice expression to roll ("1d20 - 1d4 + 3"). Added to the end ' +
					'of the ability roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
					'_[*note*] optional_: A note to add to the end of the dice roll.',
				description: `rolls an ability for your active character`,
			},
			attack: {
				name: 'attack',
				options: '[attack] [*attack_modifier*] [*damage_modifier*] [*note*]',
				usage:
					'_[attack]_: The name of the attack to roll.\n' +
					'_[*attack\\_modifier*] optional_: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
					'the end of the attack roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
					'_[*damage\\_modifier*] optional_: A dice expression to roll ("1d20 - 1d4 + 3"). Added to ' +
					'the end of the damage roll. Alternatively, a simple modifier value ("5" or "-3").\n' +
					'_[*note*] optional_: A note to add to the end of the dice roll.',
				description: `rolls an attack for your active character`,
				interactions: {
					rollEmbed: {
						rollDescription: 'attacked with their {attackName}!',
						toHit: 'To Hit',
						damage: 'Damage',
					},
				},
			},
		},
	},
	commandOptions: {
		// IMPORT
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
					'Dice to roll to join initiative. ' +
					'Modifies your skill if you chose a skill.',
			},
		},
		rollSecret: {
			name: 'secret',
			description: 'Whether to send the roll in a hidden, temporary message.',
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
	},
	utils: {
		dice: {
			rolledDice: 'rolled some dice!',
			rolledAction: 'rolled {actionName}',
			rollResult: '{rollExpression}\n{rollRenderedExpression}\n total = `{rollTotal}`',
			diceRollError: "Yip! I didn't understand the dice roll {rollExpression}.",
			diceRollOtherErrors: "Yip! I didn't understand the dice roll.\n{rollErrors}",
		},
		initiative: {
			characterNameNotFoundError:
				"Yip! You don't have control of any characters in the initiative matching that name!",
			activeCharacterNotInInitError: "Yip! Your active character isn't in this initiative!",
			noActiveInitError: "Yip! There's no active initiative in this channel.",
			initOutsideServerChannelError:
				'Yip! You can only send initiative commands in a regular server channel.',
			nextTurnInitEmptyError:
				"Yip! I can't go to the next turn when no one is in the initiative!",
			prevTurnInitEmptyError:
				"Yip! I can't go to the next turn when no one is in the initiative!",
			prevTurnInitNotStartedError:
				"Yip! I can't go to the previous turn when we haven't started initiative!",
			prevTurnNotPossibleError:
				"Yip! I can't go to the previous turn when it's " +
				'the very first turn of the first round!',
		},
		koboldEmbed: {
			cantDetermineTurnError:
				"Yip! Something went wrong! I can't figure out whose turn it is!",
			turnTitle: "It's {groupName}'s turn!",
			roundTitle: 'Initiative Round {currentRound}',
		},
	},
};

export default en;
