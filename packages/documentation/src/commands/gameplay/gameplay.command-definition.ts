import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import type { CommandDefinition } from '../helpers/commands.types.js';
import { GameplayCommandOptionEnum, gameplayCommandOptions } from './gameplay.command-options.js';
import { anyUsageContext } from '../helpers/defaults.js';
import { withOrder } from '../helpers/common.js';

export enum GameplaySubCommandEnum {
	damage = 'damage',
	set = 'set',
	recover = 'recover',
	tracker = 'tracker',
}

export const gameplayCommandDefinition = {
	metadata: {
		name: 'gameplay',
		description: 'Commands for interacting with the gameplay stats of a character or npc.',
		type: ApplicationCommandType.ChatInput,
		contexts: anyUsageContext,
		default_member_permissions: undefined,
	},
	subCommands: {
		[GameplaySubCommandEnum.damage]: {
			name: GameplaySubCommandEnum.damage,
			description:
				'Applies damage to a character, effecting tempHp, stamina (if enabled), and hp.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.targetCharacter]: withOrder(
					{
						...gameplayCommandOptions[GameplayCommandOptionEnum.targetCharacter],
						required: true,
					},
					1
				),
				[GameplayCommandOptionEnum.damageAmount]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.damageAmount],
					2
				),
				[GameplayCommandOptionEnum.damageType]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.damageType],
					3
				),
			},
		},
		[GameplaySubCommandEnum.set]: {
			name: GameplaySubCommandEnum.set,
			description: "Sets a character's gameplay stat (such as hp) to a value",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.setOption]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.setOption],
					1
				),
				[GameplayCommandOptionEnum.setValue]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.setValue],
					2
				),
				[GameplayCommandOptionEnum.targetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.targetCharacter],
					3
				),
			},
		},
		[GameplaySubCommandEnum.recover]: {
			name: GameplaySubCommandEnum.recover,
			description:
				"Resets all of a character/npc's 'recoverable' stats (hp, stamina, resolve) to their maximum values.",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.targetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.targetCharacter],
					1
				),
			},
		},
		[GameplaySubCommandEnum.tracker]: {
			name: GameplaySubCommandEnum.tracker,
			description:
				'Sets up a tracker to follow the changing statistics of one of your characters.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.targetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.targetCharacter],
					1
				),
				[GameplayCommandOptionEnum.targetChannel]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.targetChannel],
					2
				),
				[GameplayCommandOptionEnum.trackerMode]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.trackerMode],
					3
				),
			},
		},
	},
} satisfies CommandDefinition<GameplaySubCommandEnum>;
