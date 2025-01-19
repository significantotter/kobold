import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import {
	CharacterCommandOptionEnum,
	characterCommandOptions,
} from '../character/character.command-options.js';
import { CommandDefinition } from '../helpers/commands.d.js';
import { GameplayCommandOptionEnum, gameplayCommandOptions } from './gameplay.command-options.js';

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
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[GameplaySubCommandEnum.damage]: {
			name: 'damage',
			description:
				'Applies damage to a character, effecting tempHp, stamina (if enabled), and hp.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]: {
					...gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
					required: true,
				},
				[GameplayCommandOptionEnum.gameplayDamageAmount]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayDamageAmount],
				[GameplayCommandOptionEnum.gameplayDamageType]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayDamageType],
			},
		},
		[GameplaySubCommandEnum.set]: {
			name: 'set',
			description: "Sets a character's gameplay stat (such as hp) to a value",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplaySetOption]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplaySetOption],
				[GameplayCommandOptionEnum.gameplaySetValue]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplaySetValue],
				[GameplayCommandOptionEnum.gameplayTargetCharacter]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
			},
		},
		[GameplaySubCommandEnum.recover]: {
			name: 'recover',
			description:
				"Resets all of a character/npc's 'recoverable' stats (hp, stamina, resolve) to their maximum values.",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[GameplayCommandOptionEnum.gameplayTargetCharacter]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetCharacter],
			},
		},
		[GameplaySubCommandEnum.tracker]: {
			name: 'tracker',
			description:
				'Sets up a tracker to follow the changing statistics of one of your characters.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CharacterCommandOptionEnum.name]:
					characterCommandOptions[CharacterCommandOptionEnum.name],
				[GameplayCommandOptionEnum.gameplayTargetChannel]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTargetChannel],
				[GameplayCommandOptionEnum.gameplayTrackerMode]:
					gameplayCommandOptions[GameplayCommandOptionEnum.gameplayTrackerMode],
			},
		},
	},
} satisfies CommandDefinition<GameplaySubCommandEnum>;
