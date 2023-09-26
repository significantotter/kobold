import { z } from 'zod';
import {
	Entry,
	zAbilityListEntrySchema,
	zAttackEntrySchema,
	zCopySchema,
	zEntrySchema,
	zModSchema,
} from '../entries.zod.js';
import {
	zStatSchema,
	zRitualSchema,
	zSpellcastingMapSchema,
	zOtherSourceSchema,
	zTypedNumberSchema,
	zSpeedSchema,
	zAbilityScoreSchema,
} from '../helpers.zod.js';

export type Creature = z.infer<typeof zCreatureSchema>;
export const zCreatureSchema = z
	.object({
		name: z.string(),
		alias: z.string().array().optional(),
		isNpc: z.boolean().optional(),
		description: z.string().optional(),
		source: z.string().optional(),
		otherSources: zOtherSourceSchema.optional(),
		foundIn: z.string().array().optional(),
		page: z.number().optional(),
		level: z.number().optional(),
		hasImages: z.boolean().optional(),
		traits: z.array(z.string()).optional(),
		perception: zStatSchema.optional(),
		_copy: z.any().optional(),
		senses: z
			.array(
				z.object({
					name: z.string(),
					type: z.string().optional(),
					range: z.union([z.number(), zTypedNumberSchema]).optional(),
				})
			)
			.optional(),
		skills: z.object({ notes: z.string().array().optional() }).catchall(zStatSchema).optional(),
		abilityMods: zAbilityScoreSchema.optional(),
		speed: zSpeedSchema.optional(),
		attacks: z.array(zAttackEntrySchema).optional(),
		rituals: z.union([zRitualSchema.array(), z.record(z.string(), zRitualSchema)]).optional(),
		abilities: zAbilityListEntrySchema.optional(),
		defenses: z
			.object({
				ac: zStatSchema.optional(),
				savingThrows: z
					.object({
						fort: zStatSchema,
						ref: zStatSchema,
						will: zStatSchema,
						abilities: z.array(z.string()).optional(),
					})
					.optional(),
				hp: z
					.array(
						z.object({
							hp: z.number(),
							abilities: z.array(z.string()).optional(),
							note: z.string().optional(),
						})
					)
					.optional(),
				immunities: z.array(z.string()).optional(),
				resistances: z
					.array(
						z.object({
							amount: z.number().optional(),
							name: z.string(),
							note: z.string().optional(),
						})
					)
					.optional(),
				weaknesses: z
					.array(
						z.object({
							amount: z.number().optional(),
							name: z.string(),
							note: z.string().optional(),
						})
					)
					.optional(),
			})
			.optional(),
		languages: z
			.object({
				languages: z.array(z.string()).optional(),
				abilities: z.array(z.string()).optional(),
				notes: z.array(z.string()).optional(),
			})
			.optional(),
		items: z.array(z.string()).optional(),
		spellcasting: z
			.array(
				z.object({
					name: z.string().optional(),
					type: z.string().optional(),
					tradition: z.string().optional(),
					DC: z.number().optional(),
					fp: z.number().optional(),
					attack: z.number().optional(),
					entry: zSpellcastingMapSchema.optional(),
				})
			)
			.optional(),
	})
	.strict();

export type BestiarySchema = z.infer<typeof zBestiarySchema>;
export const zBestiarySchema = z
	.object({
		_meta: z.object({
			dependencies: z.object({
				creature: z.array(z.string()),
			}),
			internalCopies: z.array(z.string()),
		}),
		creature: z.array(zCreatureSchema),
	})
	.strict();

export type CreatureFluff = z.infer<typeof zCreatureFluffSchema>;
export const zCreatureFluffSchema = z
	.object({
		name: z.string(),
		altName: z.string().optional(),
		source: z.string(),
		page: z.number().optional(),
		images: z.array(z.string()).optional(),
		entries: z.array(zEntrySchema).optional(),
		_copy: zCopySchema.optional(),
	})
	.strict();

const test: Creature = {
	name: 'Aasimar Redeemer',
	source: 'B1',
	page: 263,
	level: 5,
	traits: ['ng', 'medium', 'aasimar', 'human', 'humanoid'],
	perception: { std: 11 },
	senses: [{ name: 'darkvision' }],
	languages: { languages: ['celestial', 'common'] },
	skills: {
		athletics: { std: 11 },
		diplomacy: { std: 12 },
		medicine: { std: 9 },
		religion: { std: 11 },
		society: { std: 7 },
	},
	abilityMods: { str: 4, dex: 1, con: 3, int: 0, wis: 2, cha: 3 },
	items: [
		'crossbow (10 bolts)',
		'half plate',
		'steel shield (Hardness 5, 20 HP, BT 10)',
		'longsword',
	],
	speed: { walk: 20 },
	attacks: [
		{
			range: 'Melee',
			name: 'longsword',
			attack: 15,
			traits: ['versatile <p>'],
			damage: '{@damage 1d8+7} slashing',
			types: ['slashing'],
		},
		{
			range: 'Ranged',
			name: 'crossbow',
			attack: 12,
			traits: ['range increment <120 feet>', 'reload <1>'],
			damage: '{@damage 1d8+3} piercing',
			types: ['piercing'],
		},
	],
	spellcasting: [
		{
			type: 'Innate',
			tradition: 'divine',
			DC: 20,
			entry: {
				'0': { level: 3, spells: [{ name: 'light' }] },
			},
		},
		{
			name: 'Champion Devotion Spells',
			type: 'Focus',
			DC: 20,
			fp: 1,
			entry: {
				'3': { spells: [{ name: 'lay on hands' }] },
			},
		},
	],
	abilities: {
		mid: [
			{
				activity: { number: 1, unit: 'reaction' },
				trigger: 'The angelkin is targeted by a spell that allows a saving throw.',
				entries: ['The scion gains a +2 circumstance bonus to the saving throw.'],
				name: 'Divine Grace',
			},
			{
				activity: { number: 1, unit: 'reaction' },
				trigger: "An enemy damages one of the angelkin's allies.",
				entries: [
					"Both the enemy and ally must be within 15 feet of the angelkin. The angelkin causes its foe to hesitate under the weight of its sins as visions of possible redemption play out in its mind's eye. The foe chooses one of two options:",
					{
						type: 'list',
						items: [
							'The ally is completely unharmed by the triggering damage.',
							'The ally gains resistance 7 to all damage against the triggering damage. After the damaging effect resolves, the enemy becomes {@condition enfeebled 2} until the end of its next turn.',
						],
					},
				],
				name: 'Glimpse of Redemption',
			},
			{
				activity: { number: 1, unit: 'reaction' },
				name: 'Shield Block',
				generic: { tag: 'ability' },
			},
		],
	},
	defenses: {
		ac: { std: 23, 'with shield raised': 25 },
		savingThrows: { fort: { std: 12 }, ref: { std: 8 }, will: { std: 11 } },
		hp: [{ hp: 73 }],
	},
};
