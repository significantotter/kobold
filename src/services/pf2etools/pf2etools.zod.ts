import { z } from 'zod';

export type SuccessDegreeEntry = z.infer<typeof zSuccessDegreeEntrySchema>;
export const zSuccessDegreeEntrySchema = z.object({
	type: z.literal('successDegree'),
	entries: z.object({
		'Critical Success': z.union([z.string(), z.string().array()]).optional(),
		Success: z.union([z.string(), z.string().array()]).optional(),
		Failure: z.union([z.string(), z.string().array()]).optional(),
		'Critical Failure': z.union([z.string(), z.string().array()]).optional(),
	}),
});

export type Stat = z.infer<typeof zStatSchema>;
export const zStatSchema = z.record(z.any()).and(
	z.object({
		std: z.number(),
		note: z.string().optional(),
	})
);

export type Ritual = z.infer<typeof zRitualSchema>;
export const zRitualSchema = z.object({
	tradition: z.string(),
	DC: z.union([z.number(), z.string()]),
	rituals: z.object({
		name: z.string(),
		level: z.number().optional(),
		amount: z.union([z.string(), z.number()]).optional(),
		source: z.string().optional(),
		notes: z.array(z.string()).optional(),
	}),
});

export type SpellLevel = z.infer<typeof zSpellLevelSchema>;
export const zSpellLevelSchema = z.object({
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
});

export type SpellcastingMap = z.infer<typeof zSpellcastingMapSchema>;
export const zSpellcastingMapSchema = z.object({
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
});

const baseZListEntrySchema = z.object({
	type: z.literal('list'),
});
export type ListEntry = z.infer<typeof baseZListEntrySchema> & { items: Entry[] };
const zListEntrySchema: z.ZodType<ListEntry> = baseZListEntrySchema.extend({
	items: z.lazy(() => zEntrySchema.array()),
});

export const zMultiRowSchema = z.object({
	type: z.literal('multiRow'),
	rows: z.union([z.string(), z.number()]).array().array(),
});

export type TableEntry = z.infer<typeof zTableEntrySchema>;
export const zTableEntrySchema = z.object({
	type: z.literal('table'),
	source: z.string().optional(),
	page: z.number().int().optional(),
	colStyles: z.union([z.string(), z.number()]).array().optional(),
	labelRowIdx: z.number().array().optional(),
	colSizes: z.number().array().optional(),
	rows: z.union([z.union([z.string(), z.number()]).array(), zMultiRowSchema]).array(),
});

export type Entry =
	| string
	| ListEntry
	| DataEntry
	| Pf2eOptions
	| SuccessDegreeEntry
	| Ability
	| AfflictionEntry
	| TableEntry
	| LevelEffectEntry
	| Pf2eSampleBoxEntry;
export const zEntrySchema: z.ZodType<Entry> = z.lazy(() =>
	z.union([
		z.string(),
		zListEntrySchema,
		zDataEntrySchema,
		zPf2eOptionsSchema,
		zSuccessDegreeEntrySchema,
		zAbilitySchema,
		zAfflictionEntrySchema,
		zTableEntrySchema,
		zLevelEffectEntrySchema,
		zPf2eSampleBoxEntrySchema,
	])
);

const baseAbilitySchema = z.object({
	activity: z
		.union([
			z.object({
				number: z.number(),
				unit: z.string(),
			}),
			z.object({ entry: z.string() }),
		])
		.optional(),
	components: z.string().array().optional(),
	name: z.string().optional(),
	generic: z
		.object({
			tag: z.string(),
		})
		.optional(),
	source: z.string().optional(),
	page: z.number().optional(),
	trigger: z.string().optional(),
	frequency: z
		.object({
			unit: z.string(),
			number: z.number(),
		})
		.or(z.object({ special: z.string() }))
		.optional(),
	traits: z.array(z.string()).optional(),
});
export type Ability = z.infer<typeof baseAbilitySchema> & { entries: Entry[] };
export const zAbilitySchema: z.ZodType<Ability> = baseAbilitySchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
});

const baseZStageSchema = z.object({
	stage: z.number(),
	entry: z.string().optional(),
	duration: z.union([z.string(), z.null()]).optional(),
});
export type Stage = z.infer<typeof baseZStageSchema> & { entries?: Entry[] };
export const zStageSchema: z.ZodType<Stage> = baseZStageSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()).optional(),
});

export type Affliction = z.infer<typeof zAfflictionSchema>;
export const zAfflictionSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	type: z.literal('Disease').or(z.literal('Curse')),
	level: z.number().or(z.string()).optional(),
	traits: z.string().array().optional(),
	entries: zEntrySchema.array(),
});

export const baseZAfflictionEntrySchema = z.object({
	type: z.literal('affliction'),
	name: z.string().optional(),
	onset: z.string().optional(),
	notes: z.array(z.string()).optional(),
	traits: z.array(z.string()).optional(),
	DC: z.union([z.number(), z.string()]).optional(),
	maxDuration: z.string().optional(),
	savingThrow: z.string().optional(),
});
export type AfflictionEntry = z.infer<typeof baseZAfflictionEntrySchema> & {
	entries?: Entry[];
	stages?: Stage[];
};
export const zAfflictionEntrySchema: z.ZodType<AfflictionEntry> = baseZAfflictionEntrySchema.extend(
	{
		entries: z.lazy(() => zEntrySchema.array()).optional(),
		stages: zStageSchema.array().optional(),
	}
);

const baseZItemEntrySchema = z.object({
	type: z.literal('item'),
	name: z.string(),
});
export type ItemEntry = z.infer<typeof baseZItemEntrySchema> & { entries: Entry[] };
export const zItemEntrySchema: z.ZodType<ItemEntry> = baseZItemEntrySchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
});

const basePf2eOptions = z.object({
	type: z.literal('pf2-options'),
});
export type Pf2eOptions = z.infer<typeof basePf2eOptions> & { items: ItemEntry[] };
export const zPf2eOptionsSchema: z.ZodType<Pf2eOptions> = basePf2eOptions.extend({
	items: z.lazy(() => zItemEntrySchema.array()),
});

const basePf2eSidebarSchema = z.object({
	type: z.literal('pf2-sidebar'),
	name: z.string(),
	source: z.string(),
	page: z.number(),
});
export type Pf2eSidebar = z.infer<typeof basePf2eSidebarSchema> & { entries: FluffEntry[] };
export const zPf2eSidebarSchema: z.ZodType<Pf2eSidebar> = basePf2eSidebarSchema.extend({
	entries: z.lazy(() => zFluffEntrySchema.array()),
});

export type FluffEntry = string | Pf2eSidebar | Pf2H2 | Pf2H3 | ListEntry | DataEntry;
export const zFluffEntrySchema: z.ZodType<FluffEntry> = z.lazy(() =>
	z.union([
		zPf2eSidebarSchema,
		zPf2H2Schema,
		zPf2H3Schema,
		zListEntrySchema,
		zDataEntrySchema,
		z.string(),
	])
);

const baseZPf2H2Schema = z.object({
	type: z.literal('pf2-h2'),
	name: z.string(),
	collapsible: z.boolean(),
	source: z.string(),
	page: z.number(),
});
export type Pf2H2 = z.infer<typeof baseZPf2H2Schema> & { entries: FluffEntry[] };
export const zPf2H2Schema: z.ZodType<Pf2H2> = baseZPf2H2Schema.extend({
	entries: z.lazy(() => zFluffEntrySchema.array()),
});

const baseZPf2H3Schema = z.object({
	type: z.literal('pf2-h3'),
	name: z.string(),
});
export type Pf2H3 = z.infer<typeof baseZPf2H3Schema> & { entries: FluffEntry[] };
export const zPf2H3Schema: z.ZodType<Pf2H3> = baseZPf2H3Schema.extend({
	entries: z.lazy(() => zFluffEntrySchema.array()),
});

export const zCreatureStatBlockSchema = z.object({
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
});

export type BestiaryEntrySchema = z.infer<typeof zBestiaryEntrySchema>;
export const zBestiaryEntrySchema = z.object({
	_meta: z.object({
		dependencies: z.object({
			creature: z.array(z.string()),
		}),
		internalCopies: z.array(z.string()),
	}),
	creature: z.array(zCreatureStatBlockSchema),
});

const baseZCreatureFluffSchema = z.object({
	name: z.string(),
	source: z.string(),
	images: z.array(z.string()),
	_copy: z.any().optional(),
});
type CreatureFluff = z.infer<typeof baseZCreatureFluffSchema> & { entries: FluffEntry[] };
export const zCreatureFluffSchema: z.ZodType<CreatureFluff> = baseZCreatureFluffSchema.extend({
	entries: z.lazy(() => zFluffEntrySchema.array()),
});

const baseZActionFooterSchema = z.object({
	name: z.string(),
});
export type ActionFooter = z.infer<typeof baseZActionFooterSchema> & { entries: Entry[] };
export const zActionFooterSchema: z.ZodType<ActionFooter> = baseZActionFooterSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
});

const baseZActionSchema = z.object({
	name: z.string(),
	source: z.string(),
	activity: z
		.object({
			number: z.number(),
			unit: z.string(),
			entry: z.string().optional(),
		})
		.optional(),
	page: z.number().optional(),
	traits: z.array(z.string()).optional(),
	frequency: z
		.object({
			number: z.number(),
			unit: z.string(),
		})
		.or(z.object({ special: z.string() }))
		.optional(),
	actionType: z
		.object({
			class: z.array(z.string()).optional(),
			archetype: z.array(z.string()).optional(),
		})
		.optional(),
	trigger: z.string().optional(),
	requirements: z.string().optional(),
	special: z.array(z.string()).optional(),
});
export type Action = z.infer<typeof baseZActionSchema> & {
	entries: Entry[];
	footer?: ActionFooter[];
};
export const zActionSchema: z.ZodType<Action> = baseZActionSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
	footer: z.lazy(() => zActionFooterSchema.array()).optional(),
});

const baseFeatSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number().optional(),
	level: z.number(),
	traits: z.string().array(),
	prerequisites: z.string().optional(),
	leadsTo: z.string().array().optional(),
	featType: z
		.object({
			archetype: z.union([z.string(), z.string().array()]).optional(),
			skill: z.string().array().optional(),
		})
		.optional(),
});
export type Feat = z.infer<typeof baseFeatSchema> & { entries: Entry[] };
export const zFeatSchema: z.ZodType<Feat> = baseFeatSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
});

const baseZDataEntrySchema = z.object({
	type: z.literal('data'),
	tag: z.string(),
	name: z.string().optional(),
	source: z.string().optional(),
});
export type DataEntry = z.infer<typeof baseZDataEntrySchema> & { data?: Entry };
export const zDataEntrySchema: z.ZodType<DataEntry> = baseZDataEntrySchema.extend({
	data: zEntrySchema.optional(),
});

export type VariantModEntry = z.infer<typeof zVariantModEntry>;
export const zVariantModEntry = z.object({
	mode: z.string().optional(),
	replaceTags: z.boolean().optional(),
	with: z.string().optional(),
});

export type Variant = z.infer<typeof zVariantSchema>;
export const zVariantSchema = z.object({
	variantType: z.string(),
	level: z.number().optional(),
	equipment: z.boolean().optional(),
	price: z
		.object({ coin: z.string(), amount: z.number(), note: z.string().optional() })
		.optional(),
	bulk: z.union([z.string(), z.number()]).optional(),
	entries: zEntrySchema.array().optional(),
	craftReq: z.array(z.string()).optional(),
	_mod: z
		.object({
			entries: z.union([zVariantModEntry, zVariantModEntry.array()]).optional(),
			entriesMode: z.string().optional(),
		})
		.optional(),
});

export type Item = z.infer<typeof zItemSchema>;
export const zItemSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	type: z.string().optional(),
	level: z.union([z.string(), z.number()]).optional(),
	traits: z.array(z.string()).optional(),
	category: z.union([z.string(), z.string().array()]).optional(),
	usage: z.string().optional(),
	bulk: z.union([z.string(), z.number()]).optional(),
	activate: z
		.object({
			activity: z.object({ number: z.number(), unit: z.string() }).optional(),
			components: z.array(z.string()).optional(),
		})
		.optional(),
	entries: zEntrySchema.array(),
	generic: z.string().optional(),
	variants: z.union([zVariantSchema.array(), z.null()]).optional(),
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
});

export type LevelEffectEntry = z.infer<typeof zLevelEffectEntrySchema>;
export const zLevelEffectEntrySchema = z.object({
	type: z.literal('lvlEffect'),
	entries: z
		.object({
			entry: z.string(),
			range: z.string(),
		})
		.array(),
});

const baseZPf2eSampleBoxEntrySchema = z.object({
	name: z.string(),
	type: z.literal('pf2-sample-box'),
});
type Pf2eSampleBoxEntry = z.infer<typeof baseZPf2eSampleBoxEntrySchema> & { entries: Entry[] };
export const zPf2eSampleBoxEntrySchema: z.ZodType<Pf2eSampleBoxEntry> =
	baseZPf2eSampleBoxEntrySchema.extend({
		entries: z.lazy(() => zEntrySchema.array()),
	});

export type Spell = z.infer<typeof zSpellSchema>;
export const zSpellSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	focus: z.boolean().optional(),
	level: z.number(),
	traits: z.array(z.string()),
	miscTags: z.array(z.string()).optional(),
	subclass: z.record(z.string(), z.array(z.string())).optional(),
	cast: z.object({
		number: z.number().optional(),
		unit: z.string(),
		entry: zEntrySchema.optional(),
	}),
	components: z.array(z.array(z.string())).optional(),
	area: z.object({ types: z.array(z.string()), entry: z.string() }).optional(),
	range: z.object({ number: z.number().optional(), unit: z.string() }).optional(),
	targets: z.string().optional(),
	savingThrow: z.object({ type: z.array(z.string()) }).optional(),
	duration: z.object({ number: z.number().optional(), unit: z.string().optional() }).optional(),
	entries: zEntrySchema.array(),
	heightened: z
		.object({
			plusX: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
			X: z.record(z.union([z.number(), z.string()]), zEntrySchema.array()).optional(),
		})
		.optional(),
});
