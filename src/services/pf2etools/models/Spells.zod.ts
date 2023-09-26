import { z } from 'zod';
import { zEntrySchema } from '../entries.zod.js';
import { zOtherSourceSchema, zDuration, zTypedNumberSchema } from '../helpers.zod.js';

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
		cast: zTypedNumberSchema.extend({
			entry: zEntrySchema.optional(),
		}),
		components: z.array(z.array(z.string())).optional(),
		requirements: z.string().optional(),
		trigger: z.string().optional(),
		area: z.object({ types: z.array(z.string()), entry: z.string() }).optional(),
		range: zTypedNumberSchema.optional(),
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

const spell: Spell = {
	name: 'Animal Messenger',
	source: 'CRB',
	page: 318,
	level: 2,
	traits: ['enchantment', 'mental'],
	traditions: ['primal'],
	cast: { number: 1, unit: 'minute' },
	components: [['M', 'S', 'V']],
	range: { number: 120, unit: 'feet' },
	duration: { entry: 'see text', unit: 'special' },
	entries: [
		'You offer a gift of food, and an ordinary Tiny wild animal within range approaches to eat it. You imprint the image, direction, and distance of an obvious place or landmark well known to you within the animal. Optionally, you can attach a small object or note up to light Bulk to it. The animal does its best to reach the destination; if it makes it there, it waits nearby until the duration expires, allowing other nonhostile creatures to approach it and remove the attached object. The spell ends after 24 hours or when a creature removes the attached object, whichever happens first.',
		'If there are no Tiny wild animals in range, the spell is lost.',
	],
};
