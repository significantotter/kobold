import { z } from 'zod';

export const zPriceSchema = z
	.object({
		coin: z.union([z.string(), z.null()]).optional(),
		amount: z.number().optional(),
		note: z.string().optional(),
	})
	.optional();

export const zFrequencySchema = z
	.object({
		unit: z.string().optional(),
		customUnit: z.string().optional(),
		number: z.number(),
	})
	.or(z.object({ special: z.string() }));

export const zDuration = z.union([
	z.object({ number: z.number().optional(), unit: z.string().optional() }),
	z.object({
		type: z.string(),
		entry: z.string(),
		duration: z.object({ number: z.number(), unit: z.string() }),
	}),
]);

export const zActivitySchema = z.union([
	z.object({
		number: z.number(),
		unit: z.string(),
	}),
	z.object({ entry: z.string() }),
	z.null(),
]);

export const zOtherSourceSchema = z.object({
	Expanded: z.string().array().optional(),
	Reprinted: z.string().array().optional(),
});

export const zWeaponDataSchema = z.object({
	damage: z.string(),
	damageType: z.string(),
	group: z.string(),
	hands: z.union([z.number(), z.string()]).optional(),
});

export const zActivateSchema = z.union([
	z.object({
		activity: zActivitySchema.optional(),
		components: z.array(z.string()).optional(),
		trigger: z.string().optional(),
	}),
	z.null(),
]);
