import { z } from 'zod';
import { Entry, zAfflictionEntrySchema, zEntrySchema } from './entries.zod.js';
import {
	zActivateSchema,
	zActivitySchema,
	zDuration,
	zFrequencySchema,
	zOtherSourceSchema,
	zPriceSchema,
	zWeaponDataSchema,
} from './helpers.zod.js';

export type Stat = z.infer<typeof zStatSchema>;
export const zStatSchema = z.record(z.any()).and(
	z.object({
		std: z.number(),
		note: z.string().optional(),
	})
);

export type Ritual = z.infer<typeof zRitualSchema>;
export const zRitualSchema = z
	.object({
		tradition: z.string(),
		DC: z.union([z.number(), z.string()]),
		rituals: z.object({
			name: z.string(),
			level: z.number().optional(),
			amount: z.union([z.string(), z.number()]).optional(),
			source: z.string().optional(),
			notes: z.array(z.string()).optional(),
		}),
	})
	.strict();

export type SpellLevel = z.infer<typeof zSpellLevelSchema>;
export const zSpellLevelSchema = z
	.object({
		level: z.number(),
		slots: z.number().optional(),
		spells: z.array(
			z.object({
				name: z.string(),
				amount: z.union([z.string(), z.number()]).optional(),
				source: z.string().optional(),
				notes: z.array(z.string()).optional(),
			})
		),
	})
	.strict();

export type SpellcastingMap = z.infer<typeof zSpellcastingMapSchema>;
export const zSpellcastingMapSchema = z
	.object({
		'0': zSpellLevelSchema.optional(),
		'1': zSpellLevelSchema.optional(),
		'2': zSpellLevelSchema.optional(),
		'3': zSpellLevelSchema.optional(),
		'4': zSpellLevelSchema.optional(),
		'5': zSpellLevelSchema.optional(),
		'6': zSpellLevelSchema.optional(),
		'7': zSpellLevelSchema.optional(),
		'8': zSpellLevelSchema.optional(),
		'9': zSpellLevelSchema.optional(),
		'10': zSpellLevelSchema.optional(),
	})
	.strict();

const baseAbilitySchema = z.object({
	activity: zActivitySchema.optional(),
	components: z.string().array().optional(),
	creature: z.string().array().optional(),
	name: z.string().optional(),
	add_hash: z.string().optional(),
	otherSources: zOtherSourceSchema.optional(),
	generic: z
		.object({
			tag: z.string(),
		})
		.optional(),
	source: z.string().optional(),
	page: z.number().optional(),
	trigger: z.string().optional(),
	frequency: zFrequencySchema.optional(),
	requirements: z.string().optional(),
	traits: z.array(z.string()).optional(),
});
export type Ability = z.infer<typeof baseAbilitySchema> & { entries: Entry[] };
export const zAbilitySchema = baseAbilitySchema
	.extend({
		entries: z.lazy<z.ZodType<Entry[]>>(() => zEntrySchema.array()),
	})
	.strict();

export type Affliction = z.infer<typeof zAfflictionSchema>;
export const zAfflictionSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		type: z.literal('Disease').or(z.literal('Curse')),
		level: z.number().or(z.string()).optional(),
		traits: z.string().array().optional(),
		temptedCurse: z.string().array().optional(),
		entries: zEntrySchema.array(),
	})
	.strict();

export const zCreatureStatBlockSchema = z
	.object({
		name: z.string(),
		description: z.string().optional(),
		source: z.string().optional(),
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
					range: z.number().optional(),
				})
			)
			.optional(),
		skills: z.record(zStatSchema).optional(),
		abilityMods: z
			.object({
				str: z.number(),
				dex: z.number(),
				con: z.number(),
				int: z.number(),
				wis: z.number(),
				cha: z.number(),
			})
			.optional(),
		speed: z
			.object({
				abilities: z.array(z.string()),
				walk: z.number().optional(),
				climb: z.number().optional(),
				fly: z.number().optional(),
				swim: z.number().optional(),
			})
			.optional(),
		attacks: z
			.array(
				z.object({
					range: z.string(),
					name: z.string(),
					attack: z.number(),
					effects: z.array(z.string()).optional(),
					damage: z.string(),
					types: z.array(z.string()),
					traits: z.array(z.string()).optional(),
				})
			)
			.optional(),
		rituals: z.array(zRitualSchema).optional(),
		abilities: z
			.object({
				top: z.array(z.union([zAbilitySchema, zAfflictionEntrySchema])).optional(),
				mid: z.array(z.union([zAbilitySchema, zAfflictionEntrySchema])).optional(),
				bot: z.array(z.union([zAbilitySchema, zAfflictionEntrySchema])).optional(),
			})
			.optional(),
		defenses: z
			.object({
				ac: zStatSchema,
				savingThrows: z.object({
					fort: zStatSchema,
					ref: zStatSchema,
					will: zStatSchema,
					abilities: z.array(z.string()).optional(),
				}),
				hp: z.array(
					z.object({
						hp: z.number(),
						abilities: z.array(z.string()).optional(),
						note: z.string().optional(),
					})
				),
				immunities: z.array(z.string()),
				resistances: z
					.array(
						z.object({
							amount: z.number(),
							name: z.string(),
							note: z.string().optional(),
						})
					)
					.optional(),
				weaknesses: z
					.array(
						z.object({
							amount: z.number(),
							name: z.string(),
							note: z.string().optional(),
						})
					)
					.optional(),
			})
			.optional(),
		languages: z
			.object({
				languages: z.array(z.string()),
				notes: z.array(z.string()).optional(),
			})
			.optional(),
		items: z.array(z.string()).optional(),
		spellcasting: z
			.array(
				z.object({
					type: z.string(),
					tradition: z.string(),
					DC: z.number(),
					fp: z.number().optional(),
					attack: z.number().optional(),
					entry: z
						.object({
							constant: zSpellcastingMapSchema.optional(),
						})
						.and(zSpellcastingMapSchema),
				})
			)
			.optional(),
	})
	.strict();

export type BestiaryEntrySchema = z.infer<typeof zBestiaryEntrySchema>;
export const zBestiaryEntrySchema = z
	.object({
		_meta: z.object({
			dependencies: z.object({
				creature: z.array(z.string()),
			}),
			internalCopies: z.array(z.string()),
		}),
		creature: z.array(zCreatureStatBlockSchema),
	})
	.strict();

const baseZCreatureFluffSchema = z.object({
	name: z.string(),
	source: z.string(),
	images: z.array(z.string()),
	_copy: z.any().optional(),
});
type CreatureFluff = z.infer<typeof baseZCreatureFluffSchema> & { entries: Entry[] };
export const zCreatureFluffSchema: z.ZodType<CreatureFluff> = baseZCreatureFluffSchema
	.extend({
		entries: z.lazy(() => zEntrySchema.array()),
	})
	.strict();

const baseZActionFooterSchema = z.object({
	name: z.string(),
});
export type ActionFooter = z.infer<typeof baseZActionFooterSchema> & { entries: Entry[] };
export const zActionFooterSchema: z.ZodType<ActionFooter> = baseZActionFooterSchema
	.extend({
		entries: z.lazy(() => zEntrySchema.array()),
	})
	.strict();

const baseZActionSchema = z.object({
	name: z.string(),
	alias: z.string().array().optional(),
	source: z.string(),
	activity: zActivitySchema.optional(),
	page: z.number().optional(),
	type: z.literal('action').optional(),
	traits: z.array(z.string()).optional(),
	overcome: z.string().optional(),
	prerequisites: z.string().optional(),
	frequency: zFrequencySchema.optional(),
	add_hash: z.string().optional(),
	actionType: z
		.object({
			basic: z.boolean().optional(),
			variantRule: z.string().array().optional(),
			skill: z
				.object({
					untrained: z.string().array().optional(),
					trained: z.string().array().optional(),
					expert: z.string().array().optional(),
					master: z.string().array().optional(),
					legendary: z.string().array().optional(),
				})
				.optional(),
			class: z.array(z.string()).optional(),
			archetype: z.array(z.string()).optional(),
		})
		.optional(),
	trigger: z.string().optional(),
	cost: z.string().optional(),
	requirements: z.string().optional(),
	special: z.array(z.string()).optional(),
});
export type Action = z.infer<typeof baseZActionSchema> & {
	entries: Entry[];
	info?: Entry[];
	footer?: ActionFooter[];
};
export const zActionSchema: z.ZodType<Action> = baseZActionSchema
	.extend({
		entries: z.lazy(() => zEntrySchema.array()),
		info: z.lazy(() => zEntrySchema.array()).optional(),
		footer: z.lazy(() => zActionFooterSchema.array()).optional(),
	})
	.strict();

const baseFeatSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number().optional(),
	add_hash: z.union([z.string(), z.string().array()]).optional(),
	activity: z.object({ number: z.number(), unit: z.string() }).optional(),
	trigger: z.string().optional(),
	level: z.number(),
	traits: z.string().array(),
	otherSources: zOtherSourceSchema.optional(),
	prerequisites: z.string().optional(),
	access: z.string().optional(),
	requirements: z.string().optional(),
	cost: z.string().optional(),
	frequency: zFrequencySchema.optional(),
	leadsTo: z.string().array().optional(),
	featType: z
		.object({
			archetype: z.union([z.string(), z.string().array()]).optional(),
			skill: z.string().array().optional(),
		})
		.optional(),
	amp: z.object({ entries: zEntrySchema.array() }).optional(),
	footer: z.record(z.string(), z.string()).optional(),
	special: z.union([z.string().array(), z.null()]).optional(),
});
export type Feat = z.infer<typeof baseFeatSchema> & { entries: Entry[] };
export const zFeatSchema: z.ZodType<Feat> = baseFeatSchema
	.extend({
		entries: z.lazy(() => zEntrySchema.array()),
	})
	.strict();

export type VariantModEntry = z.infer<typeof zVariantModEntry>;
export const zVariantModEntry = z
	.object({
		mode: z.string().optional(),
		replaceTags: z.boolean().optional(),
		replace: z.union([z.string(), z.object({ index: z.number() })]).optional(),
		with: z.string().optional(),
		items: z.union([zEntrySchema, zEntrySchema.array()]).optional(),
		joiner: z.string().optional(),
		str: z.string().optional(),
	})
	.strict();

const zSheildDataSchema = z
	.object({
		hardness: z.number(),
		hp: z.number(),
		bt: z.number(),
		ac: z.number().optional(),
	})
	.optional();

const zSiegeWeaponDataSchema = z.object({
	crew: z.object({ min: z.number(), max: z.number().optional() }).optional(),
	defenses: z
		.object({
			ac: z.object({ default: z.number() }),
			savingThrows: z.object({ fort: z.number(), ref: z.number() }).optional(),
			hardness: z.object({ default: z.number() }),
			hp: z.object({ default: z.number() }),
			bt: z.object({ default: z.number() }),
			immunities: z.array(z.string()).optional(),
		})
		.optional(),
	speed: z.object({ speed: z.number(), note: z.string() }).optional(),
	space: z
		.object({
			high: z.object({ number: z.number(), unit: z.string() }),
			long: z.object({ number: z.number(), unit: z.string() }),
			wide: z.object({ number: z.number(), unit: z.string() }),
		})
		.optional(),
	ammunition: z.string().optional(),
	proficiency: z.string().optional(),
});

export type Variant = z.infer<typeof zVariantSchema>;
export const zVariantSchema = z
	.object({
		name: z.string().optional(),
		variantType: z.string(),
		activate: zActivateSchema.optional(),
		appliesTo: z.string().array().optional(),
		traits: z.string().array().optional(),
		exists: z.boolean().optional(),
		source: z.string().optional(),
		page: z.number().optional(),
		level: z.number().optional(),
		otherSources: zOtherSourceSchema.optional(),
		equipment: z.boolean().optional(),
		price: zPriceSchema,
		onset: z.string().optional(),
		add_hash: z.string().optional(),
		usage: z.string().optional(),
		bulk: z.union([z.string(), z.number()]).optional(),
		hands: z.union([z.number(), z.string()]).optional(),
		entries: zEntrySchema.array().optional(),
		shieldData: zSheildDataSchema,
		siegeWeaponData: zSiegeWeaponDataSchema.optional(),
		craftReq: z.union([z.array(z.string()), z.null()]).optional(),
		_mod: z
			.object({
				entries: z.union([zVariantModEntry, zVariantModEntry.array()]).optional(),
				entriesMode: z.string().optional(),
			})
			.optional(),
	})
	.strict();

export type Item = z.infer<typeof zItemSchema>;
export const zItemSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		type: z.string().optional(),
		level: z.union([z.string(), z.number()]).optional(),
		otherSources: zOtherSourceSchema.optional(),
		traits: z.array(z.string()).optional(),
		access: z.string().optional(),
		destruction: z.string().array().optional(),
		equipment: z.boolean().optional(),
		price: zPriceSchema,
		onset: z.string().optional(),
		duration: zDuration.optional(),
		category: z.union([z.string(), z.string().array()]).optional(),
		subCategory: z.union([z.string(), z.string().array()]).optional(),
		group: z.string().optional(),
		appliesTo: z.string().array().optional(),
		usage: z.string().optional(),
		bulk: z.union([z.string(), z.number()]).optional(),
		hands: z.union([z.number(), z.string()]).optional(),
		activate: zActivateSchema.optional(),
		frequency: zFrequencySchema.optional(),
		cost: z.string().optional(),
		ammunition: z.union([z.string().array(), z.string()]).optional(),
		entries: zEntrySchema.array(),
		shieldData: zSheildDataSchema.optional(),
		siegeWeaponData: zSiegeWeaponDataSchema.optional(),
		prerequisites: z.string().optional(),
		craftReq: z.union([z.array(z.string()), z.null()]).optional(),
		generic: z.string().optional(),
		variants: z.union([zVariantSchema.array(), z.null()]).optional(),
		hasFluff: z.boolean().optional(),
		special: z.string().array().optional(),
		weaponData: zWeaponDataSchema.optional(),
		comboWeaponData: zWeaponDataSchema.optional(),
		contract: z
			.object({
				devil: z.string(),
				decipher: z.string().array(),
			})
			.optional(),
		aspects: z.string().array().optional(),
		gifts: z
			.object({
				minor: z.string().array().optional(),
				major: z.string().array().optional(),
				grand: z.string().array().optional(),
			})
			.optional(),
		_vmod: z
			.object({
				entries: z.object({
					mode: z.string(),
					replace: z.string().optional(),
					items: z.string().array().optional(),
				}),
				entriesMode: z.string().optional(),
			})
			.optional(),
		perception: z
			.object({
				default: z.number(),
				senses: z
					.object({
						precise: z.string().array().optional(),
						imprecise: z.string().array().optional(),
						notes: z.string().optional(),
					})
					.optional(),
			})
			.optional(),
		communication: z
			.object({
				name: z.string(),
				notes: z.string().optional(),
			})
			.array()
			.optional(),
		skills: z.record(z.string(), z.object({ default: z.number() })).optional(),
		abilityMods: z
			.object({
				Int: z.number().optional(),
				Wis: z.number().optional(),
				Cha: z.number().optional(),
				Str: z.number().optional(),
				Dex: z.number().optional(),
				Con: z.number().optional(),
			})
			.optional(),
		savingThrows: z.object({ Will: z.object({ default: z.number() }) }).optional(),
	})
	.strict();
export type Spell = z.infer<typeof zSpellSchema>;
export const zSpellSchema = z
	.object({
		name: z.string(),
		alias: z.union([z.string(), z.string().array()]).optional(),
		source: z.string(),
		page: z.number(),
		focus: z.boolean().optional(),
		level: z.number(),
		traits: z.array(z.string()),
		miscTags: z.array(z.string()).optional(),
		traditions: z.string().array().optional(),
		spellLists: z.string().array().optional(),
		domains: z.string().array().optional(),
		subclass: z.record(z.string(), z.array(z.string())).optional(),
		otherSources: zOtherSourceSchema.optional(),
		cast: z.object({
			number: z.number().optional(),
			unit: z.string(),
			entry: zEntrySchema.optional(),
		}),
		components: z.array(z.array(z.string())).optional(),
		requirements: z.string().optional(),
		trigger: z.string().optional(),
		area: z.object({ types: z.array(z.string()), entry: z.string() }).optional(),
		range: z.object({ number: z.number().optional(), unit: z.string() }).optional(),
		targets: z.string().optional(),
		savingThrow: z.object({ type: z.array(z.string()) }).optional(),
		duration: zDuration.optional(),
		cost: z.string().optional(),
		entries: zEntrySchema.array(),
		heightened: z
			.object({
				plusX: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
				X: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
			})
			.optional(),
		amp: z.object({ entries: zEntrySchema.array() }).optional(),
	})
	.strict();

const test: Feat = {
	name: 'Volatile Grease',
	source: 'LOTGB',
	page: 124,
	level: 6,
	featType: { archetype: ['Spell Trickster'] },
	traits: ['archetype'],
	prerequisites: '{@feat Spell Trickster Dedication|LOTGB}, ability to cast {@spell grease}',
	entries: [
		"When you cast {@spell grease}, you can modify its target to be 1 creature. If you do, replace the spell's standard effects with the following: You splash the target with combustible grease. The target must attempt a Reflex save.",
		{
			type: 'successDegree',
			entries: {
				'Critical Success': 'The target is unaffected.',
				Success:
					'The target is splattered with grease and gains weakness 2 to fire until the end of your next turn. The target or an adjacent creature can rub off the combustible grease with an {@action Interact} action, ending the effect.',
				Failure: 'As success, except the weakness to fire lasts for 1 minute.',
			},
		},
		{
			type: 'hr',
			style: 'pf2-stat__line',
			entries: ['{@b Heightened (+2)} The weakness increases by 1.'],
		},
	],
};
