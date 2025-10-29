import type { CommandDocumentation } from '../helpers/commands.d.ts';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import {
	counterGroupCommandDefinition,
	CounterGroupSubCommandEnum,
} from './counter-group.command-definition.js';
import { CounterGroupCommandOptionEnum } from './counter-group.command-options.js';

export const counterGroupCommandDocumentation: CommandDocumentation<
	typeof counterGroupCommandDefinition
> = {
	name: 'counterGroup',
	description: 'Groups of related counters.',
	subCommands: {
		[CounterGroupSubCommandEnum.list]: {
			name: CounterGroupSubCommandEnum.list,
			description: 'Lists all counters available to your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: "Ashara Keenclaw's Counter Groups",
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✓**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**',
								},
								{
									name: 'Coinpurse',
									value: '**pp** 0\n\n**gp** 10\n\n**sp** 0\n\n**cp** 0',
								},
							],
						},
					],
				},
			],
		},
		[CounterGroupSubCommandEnum.display]: {
			name: CounterGroupSubCommandEnum.display,
			description: 'Displays a counter group for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: 'Spells',
							fields: [
								{
									name: 'Rank 1',
									value: 'hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✓**, runic weapon **✓**',
								},
								{
									name: 'Rank 2',
									value: 'Briny Bolt **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterGroupSubCommandEnum.reset]: {
			name: CounterGroupSubCommandEnum.reset,
			description: "Resets all counters within a character's counter group.",
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: 'Spells',
							fields: [
								{
									name: 'Rank 1',
									value: 'hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✓**, runic weapon **✓**',
								},
								{
									name: 'Rank 2',
									value: 'Briny Bolt **✓**, Telekinetic Maneuver **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterGroupSubCommandEnum.create]: {
			name: CounterGroupSubCommandEnum.create,
			description: 'Creates a counter group for the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I created the counter group Test group for Ashara Keenclaw.',
					options: {
						[CounterGroupCommandOptionEnum.counterGroupName]: 'Coinpurse',
						[CounterGroupCommandOptionEnum.counterGroupDescription]:
							'A tracker for currency.',
					},
				},
			],
		},
		[CounterGroupSubCommandEnum.set]: {
			name: CounterGroupSubCommandEnum.set,
			description: 'Sets a field within a counter group.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: "Yip! I set description on Coinpurse to 'A tracker for currency.'",
					options: {
						[CounterGroupCommandOptionEnum.counterGroupName]: 'Coinpurse',
						[CounterGroupCommandOptionEnum.counterGroupSetOption]: 'description',
						[CounterGroupCommandOptionEnum.counterGroupSetValue]:
							'A tracker for currency.',
					},
				},
			],
		},
		[CounterGroupSubCommandEnum.remove]: {
			name: CounterGroupSubCommandEnum.remove,
			description: 'Removes a counter group from the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					message: 'Yip! I removed the counter group Coinpurse.',
					options: {
						[CounterGroupCommandOptionEnum.counterGroupName]: 'Coinpurse',
					},
				},
			],
		},
	},
};
