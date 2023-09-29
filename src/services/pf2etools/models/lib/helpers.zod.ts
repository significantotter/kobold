import { z } from 'zod';

export type TargetValueRecord = z.infer<typeof zTargetValueRecordSchema>;
export const zTargetValueRecordSchema = z.record(
	z.string(),
	z.union([z.number(), z.string(), z.record(z.string(), z.string().or(z.number()))])
);

export type Speed = z.infer<typeof zSpeedSchema>;
export const zSpeedSchema = z
	.strictObject({
		abilities: z.array(z.string()).optional(),
		walk: z.number().optional(),
		climb: z.number().optional(),
		burrow: z.number().optional(),
		fly: z.number().optional(),
		swim: z.number().optional(),
		dimensional: z.number().optional(),
		speedNote: z.string().optional(),
	})
	.catchall(z.number());

export type TypedNumber = z.infer<typeof zTypedNumberSchema>;
export const zTypedNumberSchema = z.strictObject({
	unit: z.string().optional(),
	customUnit: z.string().optional(),
	number: z.number().or(z.string()).optional(),
	entry: z.string().optional(),
});

export const zAbilityScoreSchema = z.strictObject({
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

export type Frequency = z.infer<typeof zFrequencySchema>;
export const zFrequencySchema = z
	.object({
		number: z.number().or(z.string()),
		unit: z.string().optional(),
		customUnit: z.string().optional(),
		interval: z.number().optional(),
	})
	.or(z.strictObject({ special: z.string() }));

export type Duration = z.infer<typeof zDurationSchema>;
export const zDurationSchema = z.union([
	z.strictObject({
		unit: z.string().optional(),
		customUnit: z.string().optional(),
		number: z.number().or(z.string()).optional(),
		entry: z.string().optional(),
		dismiss: z.boolean().optional(),
		sustained: z.boolean().optional(),
	}),
	z.strictObject({
		type: z.string(),
		entry: z.string(),
		duration: zTypedNumberSchema,
	}),
]);

export type Activity = z.infer<typeof zActivitySchema>;
export const zActivitySchema = z
	.object({
		unit: z.string(),
		number: z.number(),
	})
	.or(
		z.strictObject({
			unit: z.string(),
			entry: z.string(),
		})
	);

export type OtherSource = z.infer<typeof zOtherSourceSchema>;
export const zOtherSourceSchema = z.strictObject({
	Expanded: z.string().array().optional(),
	Reprinted: z.string().array().optional(),
	Originally: z.string().array().optional(),
});

export type WeaponData = z.infer<typeof zWeaponDataSchema>;
export const zWeaponDataSchema = z.strictObject({
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

export type ArmorData = z.infer<typeof zArmorDataSchema>;
export const zArmorDataSchema = z.strictObject({
	ac: z.number(),
	dexCap: z.number(),
	str: z.number().optional(),
	checkPen: z.number(),
	speedPen: z.number().optional(),
	group: z.string(),
});

export type ShieldData = z.infer<typeof zSheildDataSchema>;
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

export type Activate = z.infer<typeof zActivateSchema>;
export const zActivateSchema = z.union([
	z.strictObject({
		activity: zActivitySchema.optional(),
		components: z.array(z.string()).optional(),
		trigger: z.string().optional(),
		requirements: z.string().optional(),
		traits: z.string().array().optional(),
		note: z.string().optional(),
		prerequisites: z.string().optional(),
	}),
	z.null(),
]);

export type Stat = z.infer<typeof zStatSchema>;
export const zStatSchema = z
	.object({
		std: z.union([z.number(), z.null(), z.string()]).optional(),
		default: z.number().optional(),
		abilities: z.string().or(z.string().array()).optional(),
		notes: z.string().array().optional(),
		note: z.string().optional(),
	})
	.catchall(z.number());

const stat: Stat = {};

export const zSubRitualSchema = z.strictObject({
	name: z.string(),
	level: z.number().optional(),
	amount: z.union([z.string(), z.number()]).optional(),
	source: z.string().optional(),
	notes: z.array(z.string()).optional(),
});

export type Ritual = z.infer<typeof zRitualSchema>;
export const zRitualSchema = z.strictObject({
	tradition: z.string().optional(),
	DC: z.union([z.number(), z.string()]).optional(),
	rituals: zSubRitualSchema.or(zSubRitualSchema.array()),
});

export type SpellLevel = z.infer<typeof zSpellLevelSchema>;
export const zSpellLevelSchema = z.strictObject({
	level: z.number().optional(),
	slots: z.number().optional(),
	spells: z.array(
		z.strictObject({
			name: z.string(),
			amount: z.union([z.string(), z.number()]).optional(),
			source: z.string().optional(),
			notes: z.array(z.string()).optional(),
		})
	),
});

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
export const zSpellcastingMapSchema = z.strictObject({
	...spellCastingLevels,
	constant: z
		.object({
			...spellCastingLevels,
		})
		.optional(),
});

export type Spellcasting = z.infer<typeof zSpellcastingSchema>;
export const zSpellcastingSchema = z.strictObject({
	name: z.string().optional(),
	type: z.string().optional(),
	tradition: z.string().optional(),
	DC: z.number().optional(),
	note: z.string().optional(),
	fp: z.number().optional(),
	attack: z.number().optional(),
	entry: zSpellcastingMapSchema.optional(),
});

export type Defenses = z.infer<typeof zDefensesSchema>;
export const zDefensesSchema = z.strictObject({
	ac: zStatSchema.catchall(z.number()).optional(),
	savingThrows: z
		.object({
			fort: zStatSchema.or(z.number()).optional(),
			ref: zStatSchema.or(z.number()).optional(),
			will: zStatSchema.or(z.number()).optional(),
			abilities: z.array(z.string()).optional(),
		})
		.optional(),
	hardness: zTargetValueRecordSchema.or(z.number()).optional(),
	hp: zTargetValueRecordSchema
		.or(
			z.array(
				z.strictObject({
					hp: z.number(),
					name: z.string().optional(),
					notes: z.string().array().optional(),
					abilities: z.array(z.string()).optional(),
				})
			)
		)
		.optional(),
	bt: zTargetValueRecordSchema.optional(),
	thresholds: z.strictObject({ value: z.number(), squares: z.number() }).array().optional(),
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
