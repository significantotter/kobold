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
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					{
						...gameplayCommandOptions[
							GameplayCommandOptionEnum.gameplayTargetCharacter
						],
						required: true,
					},
					1
				),
				[GameplayCommandOptionEnum.gameplayDamageAmount]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayDamageAmount],
					2
				),
				[GameplayCommandOptionEnum.gameplayDamageType]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayDamageType],
					3
				),
			},
		},
		[GameplaySubCommandEnum.set]: {
			name: GameplaySubCommandEnum.set,
			description: "Sets a character's gameplay stat (such as hp) to a value",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplaySetOption]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplaySetOption],
					1
				),
				[GameplayCommandOptionEnum.gameplaySetValue]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplaySetValue],
					2
				),
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
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
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
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
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
					1
				),
				[GameplayCommandOptionEnum.gameplayTargetChannel]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetChannel],
					2
				),
				[GameplayCommandOptionEnum.gameplayTrackerMode]: withOrder(
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTrackerMode],
					3
				),
			},
		},
	},
} satisfies CommandDefinition<GameplaySubCommandEnum>;
