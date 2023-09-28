import { z } from 'zod';
import { zEntrySchema } from './lib/entries.zod.js';

export type Organization = z.infer<typeof zOrganizationSchema>;
export const zOrganizationSchema = z
	.object({
		name: z.string(),
		source: z.string(),
		page: z.number(),
		traits: z.array(z.string()),
		title: z.array(z.string()),
		scope: z.array(z.string()),
		goals: z.array(z.string()),
		headquarters: z.array(z.string()),
		keyMembers: z.array(z.string()),
		allies: z.array(z.string()),
		enemies: z.array(z.string()),
		assets: z.array(z.string()),
		requirements: z.array(z.string()),
		followerAlignment: z.array(
			z.object({
				main: z.string().optional(),
				secondary: z.array(z.string()).optional(),
				secondaryCustom: z.string().optional(),
				note: z.string().optional(),
				entry: z.string().optional(),
			})
		),
		values: z.array(z.string()),
		anathema: z.array(z.string()),
		hasLore: z.boolean(),
	})
	.strict();

export type OrganizationFluff = z.infer<typeof zOrganizationFluffSchema>;
export const zOrganizationFluffSchema = z.object({
	name: z.string(),
	source: z.string(),
	page: z.number().optional(),
	entries: z.array(zEntrySchema),
});
