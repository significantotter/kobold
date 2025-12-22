import type { CommandDocumentation } from '../helpers/commands.types.js';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import { RollCommandOptionEnum } from '../roll/roll.command-options.js';
import { initCommandDefinition, InitSubCommandEnum } from './init.command-definition.js';
import { InitCommandOptionEnum } from './init.command-options.js';

export const initCommandDocumentation: CommandDocumentation<typeof initCommandDefinition> = {
	name: 'init',
	description: '',
	subCommands: {
		[InitSubCommandEnum.add]: {
			name: InitSubCommandEnum.add,
			description: 'Adds an NPC or minion to initiative',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCreature]: '(creature 2) Kobold Cavern Mage',
						[InitCommandOptionEnum.initActor]: 'Kobold Wizard',
						[InitCommandOptionEnum.initCustomStats]: 'hp=35;fire weakness=5;',
						[InitCommandOptionEnum.initValue]: '15',
						[InitCommandOptionEnum.template]: 'elite',
					},
					embeds: [
						{
							title: 'Kobold Wizard joined initiative!',
							description: 'Initiative: 15',
							thumbnail:
								'https://2e.aonprd.com//Images/Monsters/Kobold_Cavern_Mage.webp',
							fields: [],
							footer: 'tags: skill, perception, initiative',
						},
					],
				},
				{
					title: 'Custom Monster Statblock',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCreature]: 'Custom Actor',
						[InitCommandOptionEnum.initActor]: 'Ferrous Butterfly',
						[InitCommandOptionEnum.initCustomStats]:
							'perception=7;senses=darkvision;traits=tiny,elemental,metal;str=2;dex=4;con=3;int=-4;wis=0;cha=0;ac=15;fort=6;ref=9;will=5;hp=20;immunities=bleed,paralyzed,poison,sleep;electricity resistance=3;speed=5;fly speed=40;acrobatics=9;wing attack=to hit:+9|traits:finesse|damage:1d4+2 slashing|effects:1 persistent bleed and A Thousand Cuts on hit;swoop attack=to hit:+9|traits:finesse|damage:1d4+2 slashing|effects:The ferrous butterfly flies up to its speed and makes a wing strike at any point during that movement. 1 persistent bleed and A Thousand Cuts on a hit;imageUrl=https://www.wargamer.com/wp-content/sites/wargamer/2023/07/pathfinder-plane-of-metal-preview-ferrous-butterfly-550x309.jpg',
						[InitCommandOptionEnum.initValue]: '15',
					},
					embeds: [
						{
							title: 'Ferrous Butterfly joined initiative!',
							description: 'd20+7\n\n[5] + 7\n\ntotal = 12',
							thumbnail:
								'https://www.wargamer.com/wp-content/sites/wargamer/2023/07/pathfinder-plane-of-metal-preview-ferrous-butterfly-550x309.jpg',
							fields: [],
							footer: 'tags: skill, perception, initiative',
						},
					],
				},
				{
					title: 'Minion',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCreature]: 'Custom NPC',
						[InitCommandOptionEnum.initActor]: 'Mature Wolf Companion (6)',
						[InitCommandOptionEnum.initCustomStats]:
							'hp=60;ac=22;fort=13;ref=14;will=12;perception=12;str=3;dex=4;con=3;int=-4;wis=2;cha=0;speed=40; climb speed=10; burrow speed=10;jaws attack=to hit:+12|damage:2d8+3 piercing|traits:finesse;imageUrl=https://2e.aonprd.com/Images/Monsters/Wolf.webp',
					},
					embeds: [
						{
							title: 'Mature Wolf Companion (6) joined initiative!',
							description: 'd20+12\n\n[18] + 12\n\ntotal = 30',
							thumbnail: 'https://2e.aonprd.com/Images/Monsters/Wolf.webp',
							fields: [],
							footer: 'tags: skill, perception, initiative',
						},
					],
				},
			],
		},
		[InitSubCommandEnum.end]: {
			name: InitSubCommandEnum.end,
			description: 'Ends the initiative in the current channel.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					message: 'Yip! Ended the initiative!',
				},
			],
		},
		[InitSubCommandEnum.join]: {
			name: InitSubCommandEnum.join,
			description:
				'Joins initiative with your active character. Defaults to rolling perception.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[RollCommandOptionEnum.rollExpression]: 'd20+5',
					},
					embeds: [
						{
							title: 'Lilac Sootsnout joined initiative!',
							description: 'd20+5\n\n[17] + 5\n\ntotal = 22',
							thumbnail:
								'https://2e.aonprd.com//Images/Monsters/Kobold_Cavern_Mage.webp',
							fields: [],
							footer: 'tags: initiative',
						},
					],
				},
			],
		},
		[InitSubCommandEnum.jumpTo]: {
			name: InitSubCommandEnum.jumpTo,
			description: 'Jumps to a specific participant in the initiative order',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCharacter]: 'Anatase Lightclaw',
					},
					embeds: [
						{
							title: "It's Anatase Lightclaw's turn!",
							description:
								'Initiative Round 1\n\n```  24: Lilac Sootsnout <HP 91/102>\n\n# 19: Anatase Lightclaw <HP 42/42>\n\n  6: Kobold Cavern Mage <HEALTHY>```',
							fields: [],
						},
					],
				},
			],
		},
		[InitSubCommandEnum.next]: {
			name: InitSubCommandEnum.next,
			description: 'Moves to the next participant in the initiative order',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCharacter]: 'Anatase Lightclaw',
					},
					embeds: [
						{
							title: "It's Kobold Cavern Mage's turn!",
							description:
								'Initiative Round 1\n\n```  24: Lilac Sootsnout <HP 91/102>\n\n  19: Anatase Lightclaw <HP 42/42>\n\n# 6: Kobold Cavern Mage <HEALTHY>```',
							fields: [],
						},
					],
				},
			],
		},
		[InitSubCommandEnum.note]: {
			name: InitSubCommandEnum.note,
			description: 'Sets a note for a character in the initiative.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCharacter]: 'Anatase Lightclaw',
						[InitCommandOptionEnum.initNote]: 'This is a note',
					},
					embeds: [
						{
							title: 'Note Set',
							description:
								'Yip! I set the note for Anatase Lightclaw to: "This is a note!"',
							fields: [],
						},
					],
				},
				{
					title: 'Removing a note',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCharacter]: 'Anatase Lightclaw',
						[InitCommandOptionEnum.initNote]: 'none',
					},
					embeds: [
						{
							title: 'Note Set',
							description: 'Yip! I set the note for Anatase Lightclaw to: ""',
							fields: [],
						},
					],
				},
			],
		},
		[InitSubCommandEnum.prev]: {
			name: InitSubCommandEnum.prev,
			description: 'Moves to the previous participant in the initiative order',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCharacter]: 'Anatase Lightclaw',
					},
					embeds: [
						{
							title: "It's Lilac Sootsnout's turn!",
							description:
								'Initiative Round 1\n\n```# 24: Lilac Sootsnout <HP 91/102>\n\n  19: Anatase Lightclaw <HP 42/42>\n\n.  This is a note!\n\n  6: Kobold Cavern Mage <HEALTHY>```',
							fields: [],
						},
					],
				},
			],
		},
		[InitSubCommandEnum.remove]: {
			name: InitSubCommandEnum.remove,
			description: 'Removes a character from initiative.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCharacter]: 'Anatase Lightclaw',
					},
					embeds: [
						{
							title: 'Yip! Anatase Lightclaw was removed from initiative.',
							fields: [],
						},
					],
				},
			],
		},
		[InitSubCommandEnum.roll]: {
			name: InitSubCommandEnum.roll,
			description: 'Rolls dice for an initiative member that you control',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCharacter]: 'Kobold Cavern Mage',
						[InitCommandOptionEnum.initRollChoice]: 'light hammer',
						[InitCommandOptionEnum.initCharacterTarget]: 'Kobold Cavern Mage',
						[RollCommandOptionEnum.rollModifier]: '2',
						[RollCommandOptionEnum.rollNote]: 'example note',
					},
					embeds: [
						{
							title: 'Kobold Cavern Mage used light hammer!',
							thumbnail:
								'https://2e.aonprd.com//Images/Monsters/Kobold_Cavern_Mage.webp',
							fields: [
								{
									name: 'To Hit. Hit!',
									value: '1d20+6+(2)\n\n[13] + 6 + 2\n\ntotal = 21',
								},
								{
									name: 'Damage',
									value: '1d6+2+0\n[4] + 2 + 0\ntotal = 6 bludgeoning',
								},
								{
									name: 'Anatase Lightclaw took damage from Kobold Cavern Mage',
									value: "Anatase Lightclaw took 6 damage from Kobold Cavern Mage's light hammer!",
								},
							],
							footer: 'Example note',
						},
					],
				},
			],
		},
		[InitSubCommandEnum.set]: {
			name: InitSubCommandEnum.set,
			description: 'Sets certain properties of your character for initiative',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCharacter]: 'Anatase Lightclaw',
						[InitCommandOptionEnum.initSetOption]: 'initiative',
						[InitCommandOptionEnum.initSetValue]: '4',
					},
					embeds: [
						{
							title: 'Anatase Lightclaw had their initiative set to 4!',
							fields: [],
						},
						{
							title: "It's Lilac Sootsnout's turn!",
							description:
								'Initiative Round 1\n\n```# 24: Lilac Sootsnout <HP 91/102>\n\n.  This is a note!\n\n  6: Kobold Cavern Mage <HEALTHY>\n\n  4: Anatase Lightclaw <HP 42/42>```',
							fields: [],
						},
					],
				},
			],
		},
		[InitSubCommandEnum.show]: {
			name: InitSubCommandEnum.show,
			description: 'Displays the current initiative order',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: 'Initiative Order',
							description:
								'Initiative Round 1\n\n```# 24: Lilac Sootsnout <HP 91/102>\n\n  6: Kobold Cavern Mage <HEALTHY>\n\n  4: Anatase Lightclaw <HP 42/42>```',
							fields: [],
						},
					],
				},
			],
		},
		[InitSubCommandEnum.start]: {
			name: InitSubCommandEnum.start,
			description: 'Start initiative in the current channel.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: 'Initiative Round 0',
							fields: [],
						},
					],
				},
			],
		},
		[InitSubCommandEnum.statBlock]: {
			name: InitSubCommandEnum.statBlock,
			description: 'Displays the statBlock for a creature in the initiative order',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[InitCommandOptionEnum.initCharacter]: 'Kobold Cavern Mage',
						[RollCommandOptionEnum.rollSecret]: 'secret',
					},
					embeds: [
						{
							title: 'Kobold Cavern Mage',
							description:
								'HP: 60/60\n\nAC 22, Perception: +12 (DC 22)\n\nSpeed: Walk 40ft Climb 10ft',
							thumbnail:
								'https://2e.aonprd.com//Images/Monsters/Kobold_Cavern_Mage.webp',
							fields: [
								{
									name: 'Abilities',
									value: 'str 3, dex 4, con 3, int -4, wis 2, cha 0',
								},
								{
									name: 'Saves',
									value: 'Fortitude: +13 (DC 23), Reflex: +14 (DC 24), Will: +12 (DC 22)',
								},
								{
									name: 'Attacks',
									value: 'Jaws +12 (finesse) Damage: 2d8+3 piercing',
								},
							],
						},
					],
				},
			],
		},
	},
};
