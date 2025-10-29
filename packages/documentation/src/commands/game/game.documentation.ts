import type { CommandDocumentation } from '../helpers/commands.d.ts';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import { RollCommandOptionEnum } from '../roll/roll.command-options.js';
import { gameCommandDefinition, GameSubCommandEnum } from './game.command-definition.js';
import { GameCommandOptionEnum } from './game.command-options.js';

export const gameCommandDocumentation: CommandDocumentation<typeof gameCommandDefinition> = {
	name: 'game',
	description: 'Commands for interacting with players as the GM of a game.',
	subCommands: {
		[GameSubCommandEnum.manage]: {
			name: GameSubCommandEnum.manage,
			description: 'The different commands to manage a game.',
			usage: null,
			examples: [
				{
					title: 'Create a game',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I created the game "Season of Ghosts" in this server.',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'create',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
				{
					title: 'Set a game as active',
					type: CommandResponseTypeEnum.success,
					message:
						'Yip! I set the game "Season of Ghosts" as your active game in this server.',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'set-active',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
				{
					title: 'Delete a game',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I deleted the game "Season of Ghosts" in this server.',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'delete',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
				{
					title: 'Kick a character',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I kicked Lilac Sootsnout out of the game "Season of Ghosts"!',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'kick',
						[GameCommandOptionEnum.gameManageValue]:
							'Season of Ghosts - Lilac Sootsnout',
					},
				},
				{
					title: 'Join a game',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! Lilac Sootsnout joined the game "Season of Ghosts"!',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'join',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
				{
					title: 'Leave a game',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! Lilac Sootsnout left the game "Season of Ghosts"!',
					options: {
						[GameCommandOptionEnum.gameManageOption]: 'leave',
						[GameCommandOptionEnum.gameManageValue]: 'Season of Ghosts',
					},
				},
			],
		},
		[GameSubCommandEnum.init]: {
			name: GameSubCommandEnum.init,
			description:
				'Starts an initiative and adds joins with all characters in the game. GM only.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameCommandOptionEnum.gameTargetCharacter]: 'Lilac Sootsnout',
						[RollCommandOptionEnum.skillChoice]: 'Society',
					},
					embeds: [
						{
							title: 'Lilac Sootsnout joined Initiative!',
							description:
								'd20+8 + "incredible initiative" 2\n\n[14] + 8 + 2\n\ntotal = 24',
							fields: [],
							footer: 'tags: initiative, skill, society, intelligence',
						},
						{
							title: 'Anatase Lightclaw joined Initiative!',
							description: 'd20+7\n\n[12] + 7\n\ntotal = 19',
							fields: [],
							footer: 'tags: initiative, skill, society, intelligence',
						},
						{
							title: 'Initiative Round 0',
							description:
								'```  24: Lilac Sootsnout <HP 91/102>\n\n.     Clumsy 1\n\n  19: Anatase Lightclaw <HP 23/42>\n\n  6: Kobold Cavern Mage <HEALTHY>\n\n.     Immune to visual. All terrain difficult.```',
							fields: [],
						},
					],
				},
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: { [GameCommandOptionEnum.gameTargetCharacter]: 'All Players' },
					message: 'Yip! All the characters in your game were already in the initiative!',
				},
			],
		},
		[GameSubCommandEnum.partyStatus]: {
			name: GameSubCommandEnum.partyStatus,
			description: 'Displays the status of all party members.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameCommandOptionEnum.gameTargetCharacter]: 'All Players',
					},
					embeds: [
						{
							title: 'Party Status',
							fields: [
								{
									name: 'Lilac Sootsnout',
									value: 'Lilac Sootsnout Sheet Level 8 Ganzi Kobold Kineticist\n\nHP: `91/102`\n\nHero Points: `3/3`, Focus Points: `1/2`',
								},
								{
									name: 'Anatase Lightclaw',
									value: 'Anatase Lightclaw Sheet Level 3 Spellscale Kobold Monk\n\nHP: `23/42`\n\nHero Points: `1/3`,',
								},
							],
						},
					],
				},
			],
		},
		[GameSubCommandEnum.give]: {
			name: GameSubCommandEnum.give,
			description: 'Gives certain resources to players in the game.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameCommandOptionEnum.gameTargetCharacter]: 'Lilac Sootsnout',
						[GameCommandOptionEnum.gameGiveOption]: 'hero points',
						[GameCommandOptionEnum.gameGiveAmount]: '1',
					},
					message: 'Yip! I gave 1 hero point(s) to Lilac Sootsnout! New total: 2/3',
				},
			],
		},
		[GameSubCommandEnum.roll]: {
			name: GameSubCommandEnum.roll,
			description: 'Rolls dice for all characters in a game (or optionally one). GM only.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[GameCommandOptionEnum.gameTargetCharacter]: 'All Players',
						[GameCommandOptionEnum.gameRollType]: 'reflex',
					},
					embeds: [
						{
							title: 'Lilac Sootsnout rolled Reflex',
							description: 'd20+16\n\n[9] + 16\n\ntotal = `25`',
							fields: [],
							footer: 'tags: save, reflex, dexterity',
						},
						{
							title: 'Anatase Lightclaw rolled Reflex',
							description: 'd20+8\n\n[14] + 8\n\ntotal = `22`',
							fields: [],
							footer: 'tags: save, reflex, dexterity',
						},
					],
				},
			],
		},
		[GameSubCommandEnum.list]: {
			name: GameSubCommandEnum.list,
			description: 'Lists all of the games you have in this server.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Games you run in this server',
					options: {},
					embeds: [
						{
							title: 'Games you run in this server',
							fields: [
								{
									name: 'Season of Ghosts (active)',
									value: 'Lilac Sootsnout\n\nAnatase Lightclaw',
								},
								{
									name: 'Gatewalkers',
									value: 'No characters added.',
								},
							],
						},
					],
				},
			],
		},
	},
};
