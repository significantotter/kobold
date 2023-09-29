import { z } from 'zod';

export type Ancestry = z.infer<typeof zAncestrySchema>;
export const zAncestrySchema = z.strictObject({
	name: z.string(),
	source: z.string(),
	page: z.number(),
	rarity: z.string(),
	hp: z.number(),
	size: z.array(z.string()),
	speed: z.strictObject({ walk: z.number() }),
	boosts: z.array(z.string()),
	flaw: z.array(z.string()),
	languages: z.array(z.string()),
	traits: z.array(z.string()),
	features: z.array(
		z.union([
			z.strictObject({
				name: z.string(),
				unarmedAttack: z.boolean(),
				entries: z.array(z.string()),
			}),
			z.strictObject({
				name: z.string(),
				entries: z.array(
					z.strictObject({
						activity: z.strictObject({ number: z.number(), unit: z.string() }),
						traits: z.array(z.string()),
						entries: z.array(z.string()),
						type: z.string(),
						style: z.string(),
						name: z.string(),
					})
				),
			}),
		])
	),
	flavor: z.array(z.string()),
	info: z.array(
		z.union([
			z.string(),
			z.strictObject({
				type: z.string(),
				page: z.number(),
				name: z.string(),
				entries: z.array(z.strictObject({ type: z.string(), items: z.array(z.string()) })),
			}),
			z.strictObject({
				type: z.string(),
				page: z.number(),
				name: z.string(),
				entries: z.array(z.string()),
			}),
			z.strictObject({
				type: z.string(),
				page: z.number(),
				reference: z.strictObject({ auto: z.boolean() }),
				source: z.string(),
				name: z.string(),
			}),
		])
	),
	heritageInfo: z.array(z.string()),
	heritage: z.array(
		z.union([
			z.strictObject({
				name: z.string(),
				shortName: z.string(),
				source: z.string(),
				page: z.number(),
				entries: z.array(z.string()),
			}),
			z.strictObject({
				name: z.string(),
				shortName: z.string(),
				source: z.string(),
				page: z.number(),
				entries: z.array(
					z.union([
						z.string(),
						z.strictObject({
							name: z.string(),
							source: z.string(),
							type: z.string(),
							style: z.string(),
							page: z.number(),
							activity: z.strictObject({ number: z.number(), unit: z.string() }),
							actionType: z.strictObject({
								ancestry: z.array(z.string()),
								heritage: z.array(z.string()),
							}),
							frequency: z.strictObject({ special: z.string() }),
							entries: z.array(z.string()),
						}),
					])
				),
			}),
		])
	),
	miscTags: z.array(z.string()),
	summary: z.strictObject({ text: z.string(), images: z.array(z.string()) }),
});
