import { z } from 'zod';
import { zActivitySchema, zFrequencySchema } from './helpers.zod.js';

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

const baseZStageSchema = z.object({
	stage: z.number(),
	entry: z.string().optional(),
	duration: z.union([z.string(), z.null()]).optional(),
});
export type Stage = z.infer<typeof baseZStageSchema> & { entries?: Entry[] };
export const zStageSchema: z.ZodType<Stage> = baseZStageSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()).optional(),
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

export const baseZAbilityEntrySchema = z.object({
	type: z.literal('ability').optional(),
	idName: z.string().optional(),
	style: z.string().optional(),
	name: z.string().optional(),
	traits: z.string().array().optional(),
	activity: zActivitySchema.optional(),
	frequency: zFrequencySchema.optional(),
	trigger: z.string().optional(),
	requirements: z.string().optional(),
	components: z.string().array().optional(),
});
export type AbilityEntry = z.infer<typeof baseZAbilityEntrySchema> & { entries: Entry[] };
const zAbilityEntrySchema: z.ZodType<AbilityEntry> = baseZAbilityEntrySchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
});

const baseZListEntrySchema = z.object({
	type: z.literal('list'),
	style: z.string().optional(),
});
export type ListEntry = z.infer<typeof baseZListEntrySchema> & { items: Entry[] };
const zListEntrySchema: z.ZodType<ListEntry> = baseZListEntrySchema.extend({
	items: z.lazy(() => zEntrySchema.array()),
});

const baseZHREntrySchema = z.object({
	type: z.literal('hr'),
	style: z.string().optional(),
});
export type HREntry = z.infer<typeof baseZHREntrySchema> & { entries: Entry[] };
const zHREntrySchema: z.ZodType<HREntry> = baseZHREntrySchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
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
	rowStyles: z.union([z.string(), z.number()]).array().optional(),
	spans: z.number().array().array().array().optional(),
	labelRowIdx: z.number().array().optional(),
	colSizes: z.number().array().optional(),
	rows: z.union([z.union([z.string(), z.number()]).array(), zMultiRowSchema]).array(),
});

const basePf2eOptions = z.object({
	type: z.literal('pf2-options'),
});
export type Pf2eOptions = z.infer<typeof basePf2eOptions> & { items: ItemEntry[] };
export const zPf2eOptionsSchema: z.ZodType<Pf2eOptions> = basePf2eOptions.extend({
	items: z.lazy(() => zItemEntrySchema.array()),
});

const baseZDataEntrySchema = z.object({
	type: z.literal('data'),
	tag: z.string(),
	name: z.string().optional(),
	source: z.string().optional(),
});
export type DataEntry = z.infer<typeof baseZDataEntrySchema> & { data?: Entry };
export const zDataEntrySchema: z.ZodType<DataEntry> = baseZDataEntrySchema.extend({
	data: z.lazy(() => zEntrySchema.optional()),
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

const baseZItemEntrySchema = z.object({
	type: z.literal('item'),
	name: z.string(),
});
export type ItemEntry = z.infer<typeof baseZItemEntrySchema> & { entries?: Entry[]; entry?: Entry };
export const zItemEntrySchema: z.ZodType<ItemEntry> = baseZItemEntrySchema.extend({
	entries: z.lazy(() => zEntrySchema.array()).optional(),
	entry: z.lazy(() => zEntrySchema).optional(),
});

const baseZPf2HSchema = z.object({
	type: z.union([
		z.literal('pf2-h1'),
		z.literal('pf2-h1-flavor'),
		z.literal('pf2-h2'),
		z.literal('pf2-h3'),
		z.literal('pf2-h4'),
		z.literal('pf2-brown-box'),
		z.literal('pf2-sample-box'),
	]),
	name: z.string().optional(),
	collapsible: z.boolean().optional(),
	source: z.string().optional(),
	page: z.number().optional(),
});
export type Pf2H = z.infer<typeof baseZPf2HSchema> & { entries: Entry[] };
export const zPf2HSchema: z.ZodType<Pf2H> = baseZPf2HSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
});

const basePf2eSidebarSchema = z.object({
	type: z.literal('pf2-sidebar'),
	name: z.string(),
	source: z.string(),
	page: z.number(),
});
export type Pf2eSidebar = z.infer<typeof basePf2eSidebarSchema> & { entries: Entry[] };
export const zPf2eSidebarSchema: z.ZodType<Pf2eSidebar> = basePf2eSidebarSchema.extend({
	entries: z.lazy(() => zEntrySchema.array()),
});

export type Entry =
	| string
	| ListEntry
	| DataEntry
	| Pf2eOptions
	| ItemEntry
	| SuccessDegreeEntry
	| AbilityEntry
	| AfflictionEntry
	| TableEntry
	| LevelEffectEntry
	| Pf2eSampleBoxEntry
	| Pf2H
	| Pf2eSidebar
	| HREntry;
export const zEntrySchema: z.ZodType<Entry> = z.lazy(() =>
	z.union([
		z.string(),
		zAbilityEntrySchema,
		zListEntrySchema,
		zDataEntrySchema,
		zPf2eOptionsSchema,
		zItemEntrySchema,
		zSuccessDegreeEntrySchema,
		zTableEntrySchema,
		zLevelEffectEntrySchema,
		zPf2eSampleBoxEntrySchema,
		zAfflictionEntrySchema,
		zPf2HSchema,
		zPf2eSidebarSchema,
		zHREntrySchema,
	])
);

const test: Entry[] = [
	{
		type: 'pf2-sample-box',
		name: 'Sample Balance Tasks',
		entries: [
			{
				type: 'list',
				style: 'list-hang-notitle',
				items: [
					{
						type: 'item',
						name: 'Untrained',
						entry: 'tangled roots, uneven cobblestones',
					},
					{ type: 'item', name: 'Trained', entry: 'wooden beam' },
					{
						type: 'item',
						name: 'Expert',
						entry: 'deep, loose gravel',
					},
					{
						type: 'item',
						name: 'Master',
						entry: 'tightrope, smooth sheet of ice',
					},
					{
						type: 'item',
						name: 'Legendary',
						entry: "razor's edge, chunks of floor falling in midair",
					},
				],
			},
		],
	},
];

// const parse = zItemFluffEntrySchema.safeParse(test); // zFluffEntrySchema.array().safeParse(test);

// if (!parse.success) {
// 	console.dir(test, { depth: null });
// 	console.dir(parse.error.format(), { depth: null });
// 	throw new Error();
// }
// console.log('parsed!!!');
// throw new Error();
