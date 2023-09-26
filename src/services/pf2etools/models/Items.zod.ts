import { z } from 'zod';
import { zEntrySchema, zModSchema } from '../entries.zod.js';
import {
	zActivateSchema,
	zOtherSourceSchema,
	zPriceSchema,
	zDuration,
	zFrequencySchema,
	zWeaponDataSchema,
	zTypedNumberSchema,
} from '../helpers.zod.js';

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
			high: zTypedNumberSchema,
			long: zTypedNumberSchema,
			wide: zTypedNumberSchema,
		})
		.optional(),
	ammunition: z.string().optional(),
	proficiency: z.string().optional(),
});

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
		_mod: zModSchema.optional(),
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
