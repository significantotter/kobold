import type { BaseTranslation } from '../i18n-types';
import Config from './../../config/config.json';

const refs = {
	bot: {
		name: 'Kobold',
		author: 'Significantotter',
	},
	colors: {
		default: '#0099ff',
		success: '#00ff83',
		warning: '#ffcc66',
		error: '#ff4a4a',
	},
	links: {
		author: 'https://github.com/significantotter',
		docs: 'https://top.gg/',
		donate: 'https://ko-fi.com/significantotter',
		invite: 'https://discord.com/',
		source: 'https://github.com/significantotter/kobold',
		support: 'https://discord.gg/6bS2GM59uj',
		template: '',
		vote: 'https://top.gg/',
	},
};

const embedLinks = {
	authorEmbed: `[${refs.bot.author}](${refs.links.author})`,
	docsEmbed: `[View Documentation](${refs.links.docs})`,
	donateEmbed: `[Help support ${refs.bot.name}'s development!](${refs.links.donate})`,
	inviteEmbed: `[Invite ${refs.bot.name} to a Server!](${refs.links.invite})`,
	sourceEmbed: `[View Source Code](${refs.links.source})`,
	supportEmbed: `[Join Support Server](${refs.links.support})`,
	templateEmbed: `[Discord Bot TypeScript Template](${refs.links.template})`,
	voteEmbed: `[Vote for ${refs.bot.name}!](${refs.links.vote})`,
	wgEmbed: `[Wanderer's Guide](https://wanderersguide.app)`,
};

const en: BaseTranslation = {
	commands: {
		character: {
			// MAIN COMMAND INFO
			name: 'character',
			description: 'Character management',

			// SHARED INTERACTIONS
			interactions: {
				noActiveCharacter: `Yip! You don't have any active characters! Use /import to import one.`,

				authenticationRequest:
					`Yip! Before you can {action} a character, you need to authenticate it. ` +
					`Give me permission to read your wanderer's guide character by following [this link](` +
					`{wgBaseUrl}?characterId={charId}). ` +
					`Then, /character/{action} your character again!`,
			},

			// SUBCOMMANDS
			import: {
				name: 'import',
				description: "Imports a Wanderer's Guide Character",
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
				interactions: {
					noCharacters: `Yip! You don't have any characters yet! Use /import to import some!`,
					characterListEmbed: {
						title: 'Characters',
						characterFieldName: '{characterName}{activeText?}',
						characterFieldValue: 'Level {level} {heritage} {ancestry} {classes}',
					},
				},
			},
			remove: {
				name: 'remove',
				description: 'removes an already imported character',
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
				description: 'sets a character as the active character',
				interactions: {
					success: 'Yip! {characterName} is now your active character!',
					notFound:
						"Yip! I couldn't find a character matching that name! " +
						"Check what characters you've imported using /character list",
				},
			},
			sheet: {
				name: 'sheet',
				description: "displays the active character's sheet",
				interactions: {
					sheet: {
						coreDataField: {
							name: 'Level {level} {heritage} {ancestry} {classes}\n',
							value:
								'Max HP `${health}`\n' +
								'AC `${armorClass}`\n' +
								'Perception `${perceptionModifier}` (DC {perceptionDC})\n' +
								'${classes} DC `${classDC}`\n' +
								'Speed `${speed}`\n\n' +
								'Background: ${background}',
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
				interactions: {
					success: `Yip! I've successfully updated {characterName}!`,
				},
			},
		},
		init: {
			name: 'init',
			description: 'Initiative Tracking',
			interactions: {},

			// SUBCOMMANDS
			start: {
				name: 'start',
				description: 'Start initiative in the current channel.',
			},
			show: {
				name: 'show',
				description: `Displays the current initiative`,
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
				name: 'jump_to',
				description: `Jumps to a specific participant in the initiative order`,
			},
			join: {
				name: 'join',
				description:
					'Joins initiative with your active character. ' +
					'Defaults to rolling perception.',
			},
			add: {
				name: 'add',
				description: `Adds a fake character to initiative`,
			},
			set: {
				name: 'set',
				description: `Sets certain properties of your character for initiative`,
			},
			remove: {
				name: 'remove',
				description: 'Removes a character from initiative.',
			},
			end: {
				name: 'end',
				description: 'Ends the initiative in the current channel.',
			},
		},
		roll: {
			name: 'roll',
			description: 'Roll Dice',
			interactions: {},

			ability: {
				name: 'ability',
				description: `rolls an ability for your active character`,
			},
			attack: {
				name: 'attack',
				description: `rolls an attack for your active character`,
			},
			dice: {
				name: 'dice',
				description: `Rolls some dice.`,
			},
			perception: {
				name: 'perception',
				description: `rolls perception for your active character`,
			},
			save: {
				name: 'save',
				description: `rolls a save for your active character`,
			},
			skill: {
				name: 'skill',
				description: `rolls a skill for your active character`,
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
			description: 'The name of the dummy character to add to initiative.',
		},
		initCharacter: {
			name: 'character',
			description: 'A character present in the initiative.',
		},
		setOption: {
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
		setValue: {
			name: 'value',
			description: 'The value to set the option to.',
		},
	},
	embedLinks,
};

export default en;
