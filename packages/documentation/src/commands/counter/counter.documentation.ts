import type { CommandDocumentation } from '../helpers/commands.d.ts';
import { CommandResponseTypeEnum } from '../helpers/enums.js';
import { counterCommandDefinition, CounterSubCommandEnum } from './counter.command-definition.js';
import { CounterCommandOptionEnum } from './counter.command-options.js';

export const counterCommandDocumentation: CommandDocumentation<typeof counterCommandDefinition> = {
	name: 'counter',
	description: 'Custom counters to track xp, per-day abilities, etc.',
	subCommands: {
		[CounterSubCommandEnum.list]: {
			name: CounterSubCommandEnum.list,
			description: 'Lists all counters available to your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {},
					embeds: [
						{
							title: "Ashara Keenclaw's Counters",
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✓**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**',
								},
								{
									name: 'Coinpurse',
									value: '**pp** 0\n\n**gp** 10\n\n**sp** 0\n\n**cp** 0',
								},
								{
									name: 'Focus Points',
									value: '*Refocus by studying*\n\nFocus Spells: Shooting Star\n\n◉〇',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.display]: {
			name: CounterSubCommandEnum.display,
			description: 'Displays a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'spells',
					},
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
		[CounterSubCommandEnum.reset]: {
			name: CounterSubCommandEnum.reset,
			description: 'Resets a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Spells',
					},
					message: "Yip! I reset Ashara Keenclaw's counter Spells.",
				},
			],
		},
		[CounterSubCommandEnum.useSlot]: {
			name: CounterSubCommandEnum.useSlot,
			description: 'Uses a prepared slot on a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Rank 1 (Spells)',
						[CounterCommandOptionEnum.counterSlot]: 'rank 2',
					},
					embeds: [
						{
							title: 'Yip! Ashara Keenclaw used runic weapon from Spells: Rank 1.',
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✗**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.value]: {
			name: CounterSubCommandEnum.value,
			description: 'Changes the value of a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'sp (Coinpurse)',
						[CounterCommandOptionEnum.counterValue]: '7',
					},
					embeds: [
						{
							title: 'Yip! I set the value of "sp" to  7.',
							fields: [
								{
									name: 'Coinpurse',
									value: '**pp** 0\n\n**gp** 10\n\n**sp** 7\n\n**cp** 0',
								},
							],
						},
					],
				},
			],
		},
		set: {
			name: CounterSubCommandEnum.set,
			description: 'Sets the value of a counter for your active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Rank 2 (Spells)',
						[CounterCommandOptionEnum.counterSetOption]: 'max',
						[CounterCommandOptionEnum.counterSetValue]: '2',
					},
					embeds: [
						{
							title: 'Yip! I set max on Rank 2 to 2.',
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✗**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**, empty **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.prepare]: {
			name: CounterSubCommandEnum.prepare,
			description: "Prepares an expendable ability in a counter's slot.",
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Spells',
						[CounterCommandOptionEnum.counterSlot]: 'rank 2',
						[CounterCommandOptionEnum.counterPrepareSlot]: 'Telekinetic Maneuver',
					},
					embeds: [
						{
							title: 'Yip! I prepared rank 2 on Ashara Keenclaw\'s counter "Spells".',
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✗**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**, Telekinetic Maneuver **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.prepareMany]: {
			name: CounterSubCommandEnum.prepareMany,
			description: "Prepares multiple expendable abilities in a counter's slots.",
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Spells',
						[CounterCommandOptionEnum.counterPrepareMany]: 'rank 1',
						[CounterCommandOptionEnum.counterPrepareFresh]: 'true',
					},
					embeds: [
						{
							title: 'Yip! I prepared rank 2, rank 3 on Ashara Keenclaw\'s counter "Spells".',
							fields: [
								{
									name: 'Spells',
									value: '**Rank 1** hydraulic push **✓**, telekinetic maneuver **✓**, runic weapon **✗**, runic weapon **✓**\n\n**Rank 2** Briny Bolt **✓**, Telekinetic Maneuver **✓**\n\n**Rank 3** empty **✓**, empty **✓**',
								},
							],
						},
					],
				},
			],
		},
		[CounterSubCommandEnum.create]: {
			name: CounterSubCommandEnum.create,
			description: 'Creates a counter for the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterStyle]: 'prepared',
						[CounterCommandOptionEnum.counterName]: 'Rank 3',
						[CounterCommandOptionEnum.counterMax]: '1',
						[CounterCommandOptionEnum.counterCounterGroupName]: 'Spells',
						[CounterCommandOptionEnum.counterRecoverable]: 'True',
					},
					message: 'Yip! I created the counter Rank 3 for Ashara Keenclaw.',
				},
			],
		},
		[CounterSubCommandEnum.remove]: {
			name: CounterSubCommandEnum.remove,
			description: 'Removes a counter for the active character.',
			usage: null,
			examples: [
				{
					title: 'Success',
					type: CommandResponseTypeEnum.success,
					options: {
						[CounterCommandOptionEnum.counterName]: 'Rank 3 (Spells)',
					},
					message: 'Yip! I removed the counter Rank 3.',
				},
			],
		},
	},
};
