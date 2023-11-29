import { z } from 'zod';

export const abilitySchema = z.union([
	z.literal('str'),
	z.literal('dex'),
	z.literal('con'),
	z.literal('int'),
	z.literal('wis'),
	z.literal('cha'),
]);

export const abilityUppercaseSchema = z.union([
	z.literal('Str'),
	z.literal('Dex'),
	z.literal('Con'),
	z.literal('Int'),
	z.literal('Wis'),
	z.literal('Cha'),
]);

export const spellTraditionSchema = z.union([
	z.literal('arcane'),
	z.literal('divine'),
	z.literal('occult'),
	z.literal('primal'),
]);

export const zPathBuilderAttributesSchema = z.object({
	ancestryhp: z.number(),
	classhp: z.number(),
	bonushp: z.number(),
	bonushpPerLevel: z.number(),
	speed: z.number(),
	speedBonus: z.number(),
});

export const zPathBuilderAbilitiesSchema = z.object({
	str: z.number(),
	dex: z.number(),
	con: z.number(),
	int: z.number(),
	wis: z.number(),
	cha: z.number(),
	breakdown: z.object({
		ancestryFree: z.array(abilityUppercaseSchema),
		ancestryBoosts: z.array(abilityUppercaseSchema),
		ancestryFlaws: z.array(abilityUppercaseSchema),
		backgroundBoosts: z.array(abilityUppercaseSchema),
		classBoosts: z.array(abilityUppercaseSchema),
		mapLevelledBoosts: z.record(z.array(abilityUppercaseSchema)),
	}),
});

export const zPathBuilderProficienciesSchema = z.object({
	classDC: z.number().optional(),
	perception: z.number().optional(),
	fortitude: z.number().optional(),
	reflex: z.number().optional(),
	will: z.number().optional(),
	heavy: z.number().optional(),
	medium: z.number().optional(),
	light: z.number().optional(),
	unarmored: z.number().optional(),
	advanced: z.number().optional(),
	martial: z.number().optional(),
	simple: z.number().optional(),
	unarmed: z.number().optional(),
	castingArcane: z.number().optional(),
	castingDivine: z.number().optional(),
	castingOccult: z.number().optional(),
	castingPrimal: z.number().optional(),
	acrobatics: z.number().optional(),
	arcana: z.number().optional(),
	athletics: z.number().optional(),
	crafting: z.number().optional(),
	deception: z.number().optional(),
	diplomacy: z.number().optional(),
	intimidation: z.number().optional(),
	medicine: z.number().optional(),
	nature: z.number().optional(),
	occultism: z.number().optional(),
	performance: z.number().optional(),
	religion: z.number().optional(),
	society: z.number().optional(),
	stealth: z.number().optional(),
	survival: z.number().optional(),
	thievery: z.number().optional(),
});

export const zPathBuilderSpecificProficienciesSchema = z.object({
	trained: z.array(z.any()),
	expert: z.array(z.any()),
	master: z.array(z.any()),
	legendary: z.array(z.any()),
});

export const zPathBuilderWeaponSchema = z.object({
	name: z.string().optional(),
	qty: z.number().optional(),
	prof: z.string().optional(),
	die: z.string().optional(),
	pot: z.number().optional(),
	str: z.string().optional(),
	mat: z.any().optional(),
	display: z.string().optional(),
	runes: z.array(z.any()).optional(),
	damageType: z.string(),
	attack: z.number(),
	damageBonus: z.number(),
	extraDamage: z.array(z.string()),
});

export const zPathBuilderMoneySchema = z.object({
	pp: z.number().optional(),
	gp: z.number().optional(),
	sp: z.number().optional(),
	cp: z.number().optional(),
});

export const zPathBuilderArmorSchema = z.object({
	name: z.string().optional(),
	qty: z.number().optional(),
	prof: z.string().optional(),
	die: z.string().optional(),
	pot: z.number().optional(),
	res: z.string().optional(),
	mat: z.any().optional(),
	display: z.string().optional(),
	worn: z.boolean().optional(),
	runes: z.array(z.any()).optional(),
});

export const zPathBuilderFocusCastingSchema = z.object({
	abilityBonus: z.number(),
	proficiency: z.number(),
	itemBonus: z.number(),
	focusCantrips: z.array(z.string()),
	focusSpells: z.array(z.string()),
});

export const zPathBuilderFocusCastingStatSchema = z.object({
	str: zPathBuilderFocusCastingSchema.optional(),
	dex: zPathBuilderFocusCastingSchema.optional(),
	con: zPathBuilderFocusCastingSchema.optional(),
	int: zPathBuilderFocusCastingSchema.optional(),
	wis: zPathBuilderFocusCastingSchema.optional(),
	cha: zPathBuilderFocusCastingSchema.optional(),
});

export const zPathBuilderFocusSchema = z.object({
	arcane: zPathBuilderFocusCastingStatSchema.optional(),
	divine: zPathBuilderFocusCastingStatSchema.optional(),
	occult: zPathBuilderFocusCastingStatSchema.optional(),
	primal: zPathBuilderFocusCastingStatSchema.optional(),
});

export const zPathBuilderSpellsAtLevelSchema = z.object({
	spellLevel: z.number(),
	list: z.array(z.string()),
});

export const zPathBuilderSpellCastingSchema = z.object({
	name: z.string(),
	magicTradition: spellTraditionSchema,
	spellcastingType: z.string(),
	ability: abilitySchema,
	proficiency: z.number(),
	spells: z.array(zPathBuilderSpellsAtLevelSchema),
	perDay: z.tuple([
		z.number(),
		z.number(),
		z.number(),
		z.number(),
		z.number(),
		z.number(),
		z.number(),
		z.number(),
		z.number(),
		z.number(),
		z.number(),
	]),
});

export const zPathBuilderPetsSchema = z.object({
	type: z.string(),
	name: z.string(),
	specific: z.any().optional(),
	abilities: z.array(z.string()).optional(),
	animal: z.string().optional(),
	mature: z.boolean(),
	incredible: z.boolean(),
	incredibleType: z.string(),
	specializations: z.array(z.any()),
	armor: z.string(),
	equipment: z.array(z.tuple([z.string(), z.number().nullable(), z.any()])),
});

export const zPathBuilderFormulaSchema = z.object({
	type: z.string(),
	known: z.array(z.string()),
});

export const zPathBuilderCharacterSchema = z.object({
	name: z.string(),
	class: z.string(),
	dualClass: z.any().optional(),
	level: z.number(),
	ancestry: z.string(),
	heritage: z.string(),
	background: z.string(),
	alignment: z.string().optional(),
	gender: z.string().optional(),
	age: z.number().optional(),
	deity: z.string().optional(),
	size: z.number(),
	keyability: z.string(),
	languages: z.array(z.string()),
	attributes: zPathBuilderAttributesSchema,
	abilities: zPathBuilderAbilitiesSchema,
	proficiencies: zPathBuilderProficienciesSchema,
	mods: z.record(z.record(z.number())),
	feats: z
		.array(
			z.tuple([
				z.string(),
				z.string().nullable(),
				z.union([z.string(), z.undefined()]).nullable(),
				z.union([z.number(), z.undefined()]).nullable(),
				z.any(),
			])
		)
		.optional(),
	specials: z.array(z.string()).optional(),
	lores: z.array(z.tuple([z.any(), z.any(), z.any()])).optional(),
	equipment: z.array(z.tuple([z.any(), z.any(), z.any()])).optional(),
	specificProficiencies: zPathBuilderSpecificProficienciesSchema,
	weapons: z.array(zPathBuilderWeaponSchema),
	money: zPathBuilderMoneySchema,
	armor: z.array(zPathBuilderArmorSchema),
	focusPoints: z.number(),
	focus: zPathBuilderFocusSchema,
	spellCasters: z.array(zPathBuilderSpellCastingSchema),
	formula: z.tuple([]),
	pets: z.tuple([]),
	acTotal: z.object({
		acProfBonus: z.number(),
		acAbilityBonus: z.number(),
		acItemBonus: z.number(),
		acTotal: z.number(),
		shieldBonus: z.number().nullable(),
	}),
});

export const zPathBuilderJsonExportSchema = z.object({
	success: z.boolean(),
	build: zPathBuilderCharacterSchema,
});
