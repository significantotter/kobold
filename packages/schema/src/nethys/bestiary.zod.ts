import * as z from 'zod';

export const AlignmentSchema = z.enum([
	'Any',
	'CE',
	'CG',
	'CN',
	'LE',
	'LG',
	'LN',
	'N',
	'NE',
	'NG',
	'No Alignment',
]);
export type Alignment = z.infer<typeof AlignmentSchema>;

export const CategorySchema = z.enum(['creature']);
export type Category = z.infer<typeof CategorySchema>;

export const ElementSchema = z.enum(['Air', 'Earth', 'Fire', 'Metal', 'Water', 'Wood']);
export type Element = z.infer<typeof ElementSchema>;

export const PfsSchema = z.enum(['Limited', 'Restricted', 'Standard']);
export type Pfs = z.infer<typeof PfsSchema>;

export const RaritySchema = z.enum(['common', 'rare', 'uncommon', 'unique']);
export type Rarity = z.infer<typeof RaritySchema>;

export const SizeSchema = z.enum(['Gargantuan', 'Huge', 'Large', 'Medium', 'Small', 'Tiny']);
export type Size = z.infer<typeof SizeSchema>;

export const SourceCategorySchema = z.enum([
	'Adventure Paths',
	'Adventures',
	'Blog Posts',
	'Lost Omens',
	'Rulebooks',
]);
export type SourceCategory = z.infer<typeof SourceCategorySchema>;

export const SourceGroupSchema = z.enum([
	'Abomination Vaults',
	'Age of Ashes',
	'Agents of Edgewatch',
	'Blood Lords',
	'Crown of the Kobold King',
	'Extinction Curse',
	'Fists of the Ruby Phoenix',
	'Gatewalkers',
	'Kingmaker',
	'Malevolence',
	'Night of the Gray Death',
	'Outlaws of Alkenstar',
	'Quest for the Frozen Flame',
	'Rusthenge',
	'Season of Ghosts',
	'Shadows at Sundown',
	"Sky King's Tomb",
	'Stolen Fate',
	'Strength of Thousands',
	'The Enmity Cycle',
	'The Fall of Plaguestone',
	'The Slithering',
	'Threshold of Knowledge',
	'Troubles in Otari',
]);
export type SourceGroup = z.infer<typeof SourceGroupSchema>;

export const EstSaveSchema = z.enum(['fort', 'fortitude', 'ref', 'reflex', 'will']);
export type EstSave = z.infer<typeof EstSaveSchema>;

export const TraitGroupSchema = z.enum([
	'Alignment',
	'Ancestry',
	'Class-Specific',
	'Creature Type',
	'Elemental',
	'Energy',
	'Equipment',
	'Half-Elf',
	'Half-Orc',
	'Monster',
	'Planar',
	'Poison',
	'Rarity',
	'School',
	'Tradition',
	'Weapon',
]);
export type TraitGroup = z.infer<typeof TraitGroupSchema>;

export const TypeSchema = z.enum(['Creature']);
export type Type = z.infer<typeof TypeSchema>;

export const VisionSchema = z.enum(['Darkvision', 'Greater darkvision', 'Low-light vision']);
export type Vision = z.infer<typeof VisionSchema>;

export const SpeedSchema = z.object({
	land: z.number().optional(),
	max: z.number().optional(),
	fly: z.number().optional(),
	swim: z.number().optional(),
	burrow: z.number().optional(),
	climb: z.number().optional(),
});
export type Speed = z.infer<typeof SpeedSchema>;

export const BestiaryEntrySchema = z.object({
	ac: z.number(),
	alignment: AlignmentSchema.optional(),
	category: CategorySchema,
	charisma: z.number(),
	constitution: z.number(),
	creature_ability: z.array(z.string()).optional(),
	creature_family: z.string().optional(),
	creature_family_markdown: z.string(),
	dexterity: z.number(),
	exclude_from_search: z.boolean(),
	fortitude_save: z.number(),
	hp: z.number(),
	hp_raw: z.string(),
	id: z.string(),
	intelligence: z.number(),
	language_markdown: z.string(),
	level: z.number(),
	markdown: z.string(),
	name: z.string(),
	npc: z.boolean(),
	perception: z.number(),
	pfs: PfsSchema.optional(),
	rarity: RaritySchema,
	rarity_id: z.number(),
	reflex_save: z.number(),
	release_date: z.string(),
	resistance: z.record(z.string(), z.number()),
	search_markdown: z.string(),
	sense: z.string().optional(),
	sense_markdown: z.string().optional(),
	size: z.array(SizeSchema),
	size_id: z.array(z.number()),
	skill: z.array(z.string()).optional(),
	skill_markdown: z.string(),
	skill_mod: z.record(z.string(), z.number()),
	source: z.array(z.string()),
	source_raw: z.array(z.string()),
	source_category: SourceCategorySchema,
	source_markdown: z.string(),
	speed: SpeedSchema,
	speed_markdown: z.string().optional(),
	speed_raw: z.string().optional(),
	spell_markdown: z.string(),
	strength: z.number(),
	strongest_save: z.array(EstSaveSchema),
	summary: z.string().optional(),
	summary_markdown: z.string().optional(),
	text: z.string(),
	trait: z.array(z.string()),
	trait_group: z.array(TraitGroupSchema),
	trait_markdown: z.string(),
	trait_raw: z.array(z.string()),
	type: TypeSchema,
	url: z.string(),
	vision: VisionSchema.optional(),
	weakest_save: z.array(EstSaveSchema),
	weakness: z.record(z.string(), z.number()),
	will_save: z.number(),
	wisdom: z.number(),
	image: z.array(z.string()).optional(),
	language: z.array(z.string()).optional(),
	resistance_markdown: z.string().optional(),
	resistance_raw: z.string().optional(),
	spell: z.array(z.string()).optional(),
	stealth: z.string().optional(),
	weakness_markdown: z.string().optional(),
	weakness_raw: z.string().optional(),
	immunity: z.array(z.string()).optional(),
	immunity_markdown: z.string().optional(),
	hardness: z.number().optional(),
	hardness_raw: z.string().optional(),
	element: z.array(ElementSchema).optional(),
	source_group: SourceGroupSchema.optional(),
	spoilers: SourceGroupSchema.optional(),
	school: z.string().optional(),
});
export type BestiaryEntry = z.infer<typeof BestiaryEntrySchema>;
