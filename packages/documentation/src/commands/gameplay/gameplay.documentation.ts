import type { CommandDocumentation } from '../helpers/commands.types.js';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import {
	gameplayCommandDefinition,
	GameplaySubCommandEnum,
} from './gameplay.command-definition.js';
import { GameplayCommandOptionEnum } from './gameplay.command-options.js';

export const gameplayCommandDocumentation: CommandDocumentation<typeof gameplayCommandDefinition> =
	{
		name: 'gameplay',
		description: "Sets a character's gameplay stat (such as hp) to a value",
		subCommands: {
			[GameplaySubCommandEnum.damage]: {
				name: GameplaySubCommandEnum.damage,
				description:
					'Applies damage to a character, effecting tempHp, stamina (if enabled), and hp.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						message: 'Anatase Lightclaw took 5 damage!',
						options: {
							[GameplayCommandOptionEnum.targetCharacter]: 'Anatase Lightclaw',
							[GameplayCommandOptionEnum.damageAmount]: 5,
							[GameplayCommandOptionEnum.damageType]: 'fire',
						},
					},
				],
			},
			[GameplaySubCommandEnum.set]: {
				name: GameplaySubCommandEnum.set,
				description: "Yip! I updated Anatase Lightclaw's hp from 18 to 22.",
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						message: 'Stat set successfully.',
						options: {
							[GameplayCommandOptionEnum.setOption]: 'hp',
							[GameplayCommandOptionEnum.setValue]: 22,
							[GameplayCommandOptionEnum.targetCharacter]: 'Anatase Lightclaw',
						},
					},
				],
			},
			[GameplaySubCommandEnum.recover]: {
				name: GameplaySubCommandEnum.recover,
				description:
					"Resets all of a character/npc's 'recoverable' stats (hp, stamina, resolve) to their maximum values.",
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						message: 'Yip! Anatase Lightclaw recovered! HP increased from 22 to 42',
						options: {
							[GameplayCommandOptionEnum.targetCharacter]: 'Anatase Lightclaw',
						},
					},
				],
			},
			[GameplaySubCommandEnum.tracker]: {
				name: GameplaySubCommandEnum.tracker,
				description:
					'Sets up a tracker to follow the changing statistics of one of your characters.',
				usage: null,
				examples: [
					{
						title: 'Success',
						type: CommandResponseTypeEnum.success,
						message:
							'Anatase Lightclaw Tracker\n\nLevel 3 Spellscale Kobold Monk\n\nHP: `42/42`\n\nHero Points: `1/3`,',
						options: {
							[GameplayCommandOptionEnum.targetCharacter]: 'Anatase Lightclaw',
							[GameplayCommandOptionEnum.targetChannel]: '#trackers',
							[GameplayCommandOptionEnum.trackerMode]: 'full-sheet',
						},
					},
				],
			},
		},
	};
