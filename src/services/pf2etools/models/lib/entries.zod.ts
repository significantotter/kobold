import { z } from 'zod';
import {
	zActivitySchema,
	zFrequencySchema,
	zOtherSourceSchema,
	zSpellcastingMapSchema,
	zTypedNumberSchema,
} from './helpers.zod.js';

export type SuccessDegreeEntry = z.infer<typeof zSuccessDegreeEntrySchema>;
export const zSuccessDegreeEntrySchema = z.strictObject({
	type: z.literal('successDegree').or(z.literal('suceessDegree')), //handle the misspelling
	entries: z.strictObject({
		'Critical Success': z.union([z.string(), z.string().array()]).optional(),
		Success: z.union([z.string(), z.string().array()]).optional(),
		Failure: z.union([z.string(), z.string().array()]).optional(),
		'Critical Failure': z.union([z.string(), z.string().array()]).optional(),
		Special: z.string().optional(),
	}),
});

export type Pf2EKeyAbility = z.infer<typeof zPf2EKeyAbilitySchema>;
export const zPf2EKeyAbilitySchema = z.strictObject({
	type: z.literal('pf2-key-ability'),
	ability: z.string().array(),
	hp: z.string().array(),
});

export const zBaseAttackEntrySchema = z.strictObject({
	type: z.string().optional(),
	range: z.string().or(z.number()).optional(),
	name: z.string(),
	attack: z.number().optional(),
	bonus: z.number().optional().describe('legacy value that just means attack'),
	damage: z.string().or(z.string().array()).optional(),
	damageType: z.string().optional(),
	damage2: z.string().optional(),
	damageType2: z.string().optional(),
	types: z.array(z.string()).optional(),
	traits: z.array(z.string()).optional(),
	noMAP: z.boolean().optional(),
	activity: zActivitySchema.optional(),

	rangedIncrement: z.boolean().optional(),
	reload: z.number().optional(),
	preciousMetal: z.string().array().optional(),
	traitNote: z.string().optional(),
	note: z.string().optional(),
});
export type AttackEntry = z.infer<typeof zBaseAttackEntrySchema> & { effects?: Entry[] };
export const zAttackEntrySchema: z.ZodType<AttackEntry> = zBaseAttackEntrySchema.extend({
	effects: z.lazy(() => zEntrySchema.array()).optional(),
});

export type ImageEntry = z.infer<typeof zImageEntrySchema>;
const zImageEntrySchema = z.strictObject({
	type: z.literal('image'),
	href: z.strictObject({ type: z.string(), path: z.string() }),
	maxRes: z.strictObject({ type: z.string(), path: z.string() }).optional(),
	style: z.string(),
});
const baseZStageSchema = z.strictObject({
	stage: z.number(),
	entry: z.string().optional(),
	duration: z.union([z.string(), z.null()]).optional(),
});
export type Stage = z.infer<typeof baseZStageSchema> & { entries?: Entry[] };
export const zStageSchema: z.ZodType<Stage> = baseZStageSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()).optional(),
});

export const baseZAfflictionEntrySchema = z.strictObject({
	type: z.union([z.literal('affliction'), z.literal('Disease'), z.literal('Curse')]),
	number: z.any().optional().describe('ignored by pf2etools'),
	source: z.string().optional(),
	page: z.number().optional(),
	level: z.number().or(z.string()).optional(),
	note: z.string().optional(),
	name: z.string().optional(),
	onset: z.string().optional(),
	notes: z.array(z.string()).optional(),
	traits: z.array(z.string()).optional(),
	DC: z.union([z.number(), z.string()]).optional(),
	maxDuration: z.string().optional(),
	savingThrow: z.string().optional(),
	temptedCurse: z.string().array().optional(),
	stages: zStageSchema.array().optional(),
});
export type AfflictionEntry = z.infer<typeof baseZAfflictionEntrySchema> & {
	entries?: Entry[];
};
export const zAfflictionEntrySchema: z.ZodType<AfflictionEntry> = baseZAfflictionEntrySchema.extend(
	{
		entries: z.lazy(() => zEntrySchema.array()).optional(),
	}
);

export const baseZAbilityEntrySchema = z.strictObject({
	type: z.literal('ability').optional(),
	idName: z.string().optional(),
	style: z.string().optional(),
	name: z.string().optional(),
	title: z.string().optional(),
	source: z.string().optional(),
	page: z.number().optional(),
	cost: z.string().optional(),
	traits: z.string().array().optional(),
	activity: zActivitySchema.optional(),
	frequency: zFrequencySchema.optional(),
	requirements: z.string().optional(),
	requirement: z.string().optional(),
	prerequisites: z.string().optional(),
	actionType: z
		.object({
			class: z.string().array().optional(),
			archetype: z.string().array().optional(),
			ancestry: z.string().array().optional(),
			heritage: z.string().array().optional(),
		})
		.optional(),
	range: zTypedNumberSchema.optional(),
	area: z
		.object({
			entry: z.string(),
			types: z.string().array(),
		})
		.optional(),
	trigger: z.string().optional(),
	components: z.string().array().optional(),
	component: z.string().array().optional(),
	generic: z
		.strictObject({
			tag: z.string(),
			source: z.string().optional(),
			name: z.string().optional(),
			add_hash: z.string().optional(),
		})
		.optional(),
	note: z.string().optional(),
	special: z.string().array().optional(),

	creature: z.string().array().optional(),
	add_hash: z.string().optional(),
	otherSources: zOtherSourceSchema.optional(),
});
export type AbilityEntry = z.infer<typeof baseZAbilityEntrySchema> & {
	entries?: Entry[];
	entries_as_xyz?: Entry[] | string;
};
export const zAbilityEntrySchema: z.ZodType<AbilityEntry> = baseZAbilityEntrySchema.extend({
	entries: z.lazy(() => zEntrySchema.array()).optional(),
	entries_as_xyz: z.lazy(() => zEntrySchema.array().or(z.string())).optional(),
});

export const zAbilityListEntrySchema = z.strictObject({
	top: z.array(z.union([zAbilityEntrySchema, zAfflictionEntrySchema])).optional(),
	mid: z.array(z.union([zAbilityEntrySchema, zAfflictionEntrySchema])).optional(),
	bot: z.array(z.union([zAbilityEntrySchema, zAfflictionEntrySchema])).optional(),
});
export const zMultiRowSchema = z.strictObject({
	type: z.literal('multiRow'),
	rows: z.union([z.string(), z.number()]).array().array(),
});

export type TableEntry = z.infer<typeof zTableEntrySchema>;
export const zTableEntrySchema = z.strictObject({
	type: z.literal('table'),
	id: z.string().optional(),
	name: z.string().optional(),
	alias: z.string().array().optional(),
	caption: z.string().optional(),
	intro: z.string().array().optional(),
	outro: z.string().array().optional(),
	style: z.string().optional(),
	source: z.string().optional(),
	page: z.number().int().optional(),
	minimizeTo: z.number().array().optional(),
	colLabels: z.string().array().optional(),
	colStyles: z.union([z.string(), z.number()]).array().optional(),
	rowStyles: z
		.union([z.string(), z.number(), z.strictObject({ row: z.number(), style: z.string() })])
		.array()
		.optional(),
	cellStyles: z
		.union([
			z.string(),
			z.number(),
			z.strictObject({ row: z.number(), col: z.number(), style: z.string() }),
		])
		.array()
		.optional(),
	rollable: z.boolean().optional(),
	spans: z.number().array().array().array().optional(),
	labelRowIdx: z.number().array().optional(),
	labelColIdx: z.number().array().optional(),
	rowLabelIdx: z.number().array().optional(),
	colSizes: z.number().array().optional(),
	rows: z.union([z.union([z.string(), z.number()]).array(), zMultiRowSchema]).array(),
	footnotes: z.string().array().optional(),
	footStyles: z.string().array().optional(),
});

export type TableGroupEntry = z.infer<typeof zTableGroupEntrySchema>;
export const zTableGroupEntrySchema = z.strictObject({
	type: z.literal('tableGroup'),
	source: z.string().optional(),
	page: z.number().optional(),
	tables: zTableEntrySchema.array(),
});

const basePf2eOptions = z.strictObject({
	type: z.literal('pf2-options'),
	skipSort: z.boolean().optional(),
	noColon: z.boolean().optional(),
	style: z.string().optional(),
});
export type Pf2eOptions = z.infer<typeof basePf2eOptions> & { items: Entry[] };
export const zPf2eOptionsSchema: z.ZodType<Pf2eOptions> = basePf2eOptions.extend({
	items: z.lazy(() => zEntrySchema.array()),
});

const baseZDataContentEntrySchema = z.strictObject({
	name: z.string().optional(),
	traits: z.string().array().optional(),
	category: z.string().optional(),
	level: z.string().optional(),
});
export type DataContentEntry = z.infer<typeof baseZDataContentEntrySchema> & {
	sections?: Entry[][][];
};
export const zDataContentEntrySchema: z.ZodType<DataContentEntry> =
	baseZDataContentEntrySchema.extend({
		sections: z.lazy(() => zEntrySchema.array().array().array().optional()),
	});

const baseZDataEntrySchema = z.strictObject({
	type: z.literal('data'),
	style: z.string().optional(),
	tag: z.string(),
	name: z.string().optional(),
	source: z.string().optional(),
});
export type DataEntry = z.infer<typeof baseZDataEntrySchema> & {
	data?: Entry | DataContentEntry | any;
};
export const zDataEntrySchema: z.ZodType<DataEntry> = baseZDataEntrySchema.extend({
	data: z.lazy(() => zEntrySchema.or(zDataContentEntrySchema).or(z.any()).optional()),
});

export type LevelEffectEntry = z.infer<typeof zLevelEffectEntrySchema>;
export const zLevelEffectEntrySchema = z
	.object({
		type: z.literal('lvlEffect'),
		entries: z
			.object({
				entry: z.string(),
				range: z.string(),
			})
			.array(),
	})
	.describe('An effect with different results based on level ranges');

const baseZSemanticEntrySchema = z.strictObject({
	type: z.union([
		z.literal('list'),
		z.literal('entries'),
		z.literal('section'),
		z.literal('text'),
		z.literal('item'),
		z.literal('homebrew'),
		z.literal('entriesOtherSource'),
		z.literal('pf2-h1'),
		z.literal('pf2-h1-flavor'),
		z.literal('pf2-h2'),
		z.literal('pf2-h3'),
		z.literal('pf2-h4'),
		z.literal('pf2-h5'),
		z.literal('pf2-inset'),
		z.literal('pf2-beige-box'),
		z.literal('pf2-brown-box'),
		z.literal('pf2-red-box'),
		z.literal('pf2-sample-box'),
		z.literal('pf2-tips-box'),
		z.literal('pf2-key-box'),
		z.literal('pf2-sidebar'),
		z.literal('pf2-title'),
		z.literal('inline'),
		z.literal('hr'),
		z.literal('paper'),
	]),
	title: z.string().optional(),
	style: z.string().optional(),
	head: z.string().array().optional(),
	noIndentLastEntry: z.boolean().optional(),
	centered: z.boolean().optional(),
	level: z.number().or(z.string()).optional(),
	traits: z.string().array().optional(),
	name: z.string().optional(),
	blue: z.boolean().optional(),
	reference: z
		.object({
			auto: z.boolean().optional(),
			index: z.number().optional(),
			entry: z.string().optional(),
		})
		.optional(),
	alias: z.string().array().optional(),
	collapsible: z.boolean().optional(),
	source: z.string().optional(),
	page: z.number().optional(),
	step: z.string().or(z.number()).optional(),
	columns: z.number().optional(),
	column: z.number().optional(),
	data: z
		.object({ quickrefIndex: z.boolean().optional(), quickref: z.number().optional() })
		.optional(),
	signature: z.string().array().optional(),
	oldEntries: z.string().array().optional(), // homebrew
	movedTo: z.string().optional(), // homebrew
});
export type SemanticEntry = z.infer<typeof baseZSemanticEntrySchema> & {
	entries?: Entry[];
	entry?: Entry;
	items?: Entry[];
};
export const zSemanticEntrySchema: z.ZodType<SemanticEntry> = baseZSemanticEntrySchema.extend({
	entries: z.lazy(() => zEntrySchema.array()).optional(),
	items: z.lazy(() => zEntrySchema.array()).optional(),
	entry: z.lazy(() => zEntrySchema).optional(),
});

export type QuoteEntry = z.infer<typeof zQuoteEntrySchema>;
const zQuoteEntrySchema = z.strictObject({
	type: z.literal('quote'),
	from: z.string().optional(),
	by: z.string(),
	entries: z.string().array(),
});

export type RefEntry = z.infer<typeof zRefEntrySchema>;
export const zRefEntrySchema = z.strictObject({
	type: z.literal('refClassFeature'),
	classFeature: z.string(),
});

export type Entry =
	| string
	| DataEntry
	| Pf2eOptions
	| SuccessDegreeEntry
	| AttackEntry
	| AbilityEntry
	| AfflictionEntry
	| TableEntry
	| TableGroupEntry
	| ImageEntry
	| LevelEffectEntry
	| SemanticEntry
	| QuoteEntry
	| Pf2EKeyAbility
	| RefEntry;
export const zEntrySchema: z.ZodType<Entry> = z.lazy(() =>
	z.union([
		z.string(),
		zAbilityEntrySchema,
		zDataEntrySchema,
		zPf2eOptionsSchema,
		zSuccessDegreeEntrySchema,
		zAttackEntrySchema,
		zTableEntrySchema,
		zTableGroupEntrySchema,
		zImageEntrySchema,
		zLevelEffectEntrySchema,
		zAfflictionEntrySchema,
		zSemanticEntrySchema,
		zQuoteEntrySchema,
		zPf2EKeyAbilitySchema,
		zRefEntrySchema,
	])
);

export type VariantModEntry = z.infer<typeof zVariantModEntry>;
const zVariantModEntry = z.strictObject({
	mode: z.string().optional(),
	replaceTags: z.boolean().optional(),
	replace: z.union([z.string(), z.strictObject({ index: z.number() })]).optional(),
	with: z.string().optional(),
	items: z.union([zEntrySchema, zEntrySchema.array()]).optional(),
	joiner: z.string().optional(),
	str: z.string().optional(),
});
export type Mod = z.infer<typeof zModSchema>;
export const zModSchema = z.strictObject({
	entries: z.union([zVariantModEntry, zVariantModEntry.array()]).optional(),
	entriesMode: z.string().optional(),
});

export type Copy = z.infer<typeof zCopySchema>;
export const zCopySchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	_mod: zModSchema.optional(),
});

export type Fluff = z.infer<typeof zFluffSchema>;
export const zFluffSchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number().optional(),
	entries: z.array(zEntrySchema).optional(),
	images: z.string().array().optional(),
	lore: z.array(zEntrySchema).optional(),
	_copy: zCopySchema.optional(),
});

const test: Entry[] = [
	"You upgrade the vishkanyan venom you can apply with {@action Envenom|LOIL} to moderate vishkanyan venom. {@action Envenom|LOIL}'s frequency becomes once per 10 minutes.",
	{
		type: 'affliction',
		name: 'Moderate Vishkanyan Venom',
		number: { number: 10, unit: 'minute' },
		note: 'Level 9',
		savingThrow: 'Fortitude',
		maxDuration: '6 rounds',
		stages: [
			{
				stage: 1,
				entry: '{@damage 3d6} poison damage',
				duration: '1 round',
			},
			{
				stage: 2,
				entry: '{@damage 4d6} poison damage',
				duration: '1 round',
			},
			{
				stage: 3,
				entry: '{@damage 5d6} poison damage',
				duration: '1 round',
			},
		],
	},
];
