import { z } from 'zod';

export const zTargetValueRecordSchema = z.record(
	z.string(),
	z.union([z.number(), z.string(), z.record(z.string(), z.string().or(z.number()))])
);

export const zDefensesSchema = z.object({
	ac: z
		.object({ std: z.number().optional(), default: z.number().optional() })
		.catchall(z.number())
		.optional(),
	savingThrows: z
		.object({
			fort: z
				.object({
					std: z.number().optional(),
					default: z.number().optional(),
					abilities: z.array(z.string()).optional(),
				})
				.or(z.number())
				.optional(),
			ref: z
				.object({ std: z.number().optional(), default: z.number().optional() })
				.or(z.number())
				.optional(),
			will: z
				.object({ std: z.number().optional(), default: z.number().optional() })
				.or(z.number())
				.optional(),
			abilities: z.array(z.string()).optional(),
		})
		.optional(),
	hardness: zTargetValueRecordSchema.optional(),
	hp: zTargetValueRecordSchema.optional(),
	bt: zTargetValueRecordSchema.optional(),
	immunities: z.array(z.string()).optional(),
	weaknesses: z
		.object({
			name: z.string(),
			amount: z.number().optional(),
			note: z.string().optional(),
		})
		.or(z.string())
		.array()
		.optional(),
	resistances: z
		.object({
			name: z.string(),
			amount: z.number().optional(),
			note: z.string().optional(),
		})
		.or(z.string())
		.array()
		.optional(),
});

export const zSpeedSchema = z.object({
	abilities: z.array(z.string()).optional(),
	walk: z.number().optional(),
	climb: z.number().optional(),
	burrow: z.number().optional(),
	fly: z.number().optional(),
	swim: z.number().optional(),
	dimensional: z.number().optional(),
});

export const zSenseSchema = z.object({
	imprecise: z.string().array().optional(),
	other: z.string().array().optional(),
});

export const zTypedNumberSchema = z.object({
	unit: z.string().optional(),
	customUnit: z.string().optional(),
	number: z.number().or(z.string()).optional(),
	entry: z.string().optional(),
});

export const zAbilityScoreSchema = z.object({
	str: z.number(),
	dex: z.number(),
	con: z.number(),
	int: z.number(),
	wis: z.number(),
	cha: z.number(),
});

export const zPriceSchema = z
	.object({
		coin: z.union([z.string(), z.null()]).optional(),
		amount: z.number().optional(),
		note: z.string().optional(),
	})
	.optional();

export const zFrequencySchema = zTypedNumberSchema
	.extend({ interval: z.number().optional() })
	.or(z.object({ special: z.string() }));

export const zDuration = z.union([
	zTypedNumberSchema,
	z.object({
		type: z.string(),
		entry: z.string(),
		duration: zTypedNumberSchema,
	}),
]);

export const zActivitySchema = z.union([
	zTypedNumberSchema,
	z.object({ entry: z.string() }),
	z.null(),
]);

export const zOtherSourceSchema = z.object({
	Expanded: z.string().array().optional(),
	Reprinted: z.string().array().optional(),
	Originally: z.string().array().optional(),
});

export const zWeaponDataSchema = z.object({
	type: z.string().optional(),
	ammunition: z.string().optional(),
	reload: z.number().or(z.string()).optional(),
	range: z.number().optional(),
	damage: z.string(),
	damageType: z.string(),
	damage2: z.string().optional(),
	damageType2: z.string().optional(),
	group: z.string(),
	hands: z.union([z.number(), z.string()]).optional(),
	traits: z.string().array().optional(),
});

export const zArmorDataSchema = z.object({
	ac: z.number(),
	dexCap: z.number(),
	str: z.number().optional(),
	checkPen: z.number(),
	speedPen: z.number().optional(),
	group: z.string(),
});
export const zSheildDataSchema = z
	.object({
		hardness: z.number(),
		hp: z.number(),
		bt: z.number(),
		ac: z.number().optional(),
		ac2: z.number().optional(),
		speedPen: z.number().optional(),
	})
	.optional();

export const zActivateSchema = z.union([
	z.object({
		activity: zActivitySchema.optional(),
		components: z.array(z.string()).optional(),
		trigger: z.string().optional(),
	}),
	z.null(),
]);

export type Stat = z.infer<typeof zStatSchema>;
export const zStatSchema = z
	.object({
		std: z.union([z.number(), z.null(), z.string()]),
		abilities: z.string().or(z.string().array()).optional(),
		notes: z.string().array().optional(),
		note: z.string().optional(),
	})
	.catchall(z.number());

export const zSubRitualSchema = z.object({
	name: z.string(),
	level: z.number().optional(),
	amount: z.union([z.string(), z.number()]).optional(),
	source: z.string().optional(),
	notes: z.array(z.string()).optional(),
});

export type Ritual = z.infer<typeof zRitualSchema>;
export const zRitualSchema = z
	.object({
		tradition: z.string().optional(),
		DC: z.union([z.number(), z.string()]).optional(),
		rituals: zSubRitualSchema.or(zSubRitualSchema.array()),
	})
	.strict();

export type SpellLevel = z.infer<typeof zSpellLevelSchema>;
export const zSpellLevelSchema = z
	.object({
		level: z.number().optional(),
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

const spellCastingLevels = {
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
};

export type SpellcastingMap = z.infer<typeof zSpellcastingMapSchema>;
export const zSpellcastingMapSchema = z
	.object({
		...spellCastingLevels,
		constant: z
			.object({
				...spellCastingLevels,
			})
			.optional(),
	})
	.strict();
