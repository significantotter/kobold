import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord-api-types/v10';
import { CommandDefinition } from '../helpers/commands.d.js';
import {
	CounterGroupCommandOptionEnum,
	counterGroupCommandOptions,
} from './counter-group.command-options.js';

export enum CounterGroupSubCommandEnum {
	list = 'list',
	display = 'display',
	reset = 'reset',
	create = 'create',
	set = 'set',
	remove = 'remove',
}

export const counterGroupCommandDefinition = {
	metadata: {
		name: 'counter-group',
		description: 'Groups of related counters.',
		type: ApplicationCommandType.ChatInput,
		dm_permission: true,
		default_member_permissions: undefined,
	},
	subCommands: {
		[CounterGroupSubCommandEnum.list]: {
			name: 'list',
			description: 'Lists all counter groups available to your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {},
		},
		[CounterGroupSubCommandEnum.display]: {
			name: 'display',
			description: 'Displays a counter group for your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]: {
					...counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupName],
					autocomplete: true,
					choices: undefined,
				},
			},
		},
		[CounterGroupSubCommandEnum.reset]: {
			name: 'reset',
			description: "Resets all counters within a character's counter group.",
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]: {
					...counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupName],
					autocomplete: true,
					choices: undefined,
				},
			},
		},
		[CounterGroupSubCommandEnum.create]: {
			name: 'create',
			description: 'Creates a counter group for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]:
					counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupName],
				[CounterGroupCommandOptionEnum.counterGroupDescription]:
					counterGroupCommandOptions[
						CounterGroupCommandOptionEnum.counterGroupDescription
					],
			},
		},
		[CounterGroupSubCommandEnum.set]: {
			name: 'set',
			description: 'Sets the value of a counter group for your active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]: {
					...counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupName],
					autocomplete: true,
					choices: undefined,
				},
				[CounterGroupCommandOptionEnum.counterGroupSetOption]:
					counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupSetOption],
				[CounterGroupCommandOptionEnum.counterGroupSetValue]:
					counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupSetValue],
			},
		},
		[CounterGroupSubCommandEnum.remove]: {
			name: 'remove',
			description: 'Removes a counter group for the active character.',
			type: ApplicationCommandOptionType.Subcommand,
			options: {
				[CounterGroupCommandOptionEnum.counterGroupName]: {
					...counterGroupCommandOptions[CounterGroupCommandOptionEnum.counterGroupName],
					autocomplete: true,
					choices: undefined,
				},
			},
		},
	},
} satisfies CommandDefinition<CounterGroupSubCommandEnum>;
