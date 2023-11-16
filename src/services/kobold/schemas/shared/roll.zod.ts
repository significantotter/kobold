import { z } from 'zod';

export enum RollTypeEnum {
	attack = 'attack',
	skillChallenge = 'skill-challenge',
	damage = 'damage',
	advancedDamage = 'advanced-damage',
	save = 'save',
	text = 'text',
}

export type BaseRoll = z.infer<typeof zBaseRoll>;
export const zBaseRoll = z.strictObject({
	name: z.string(),
	allowRollModifiers: z.boolean().default(false),
});
export type AttackOrSkillRoll = z.infer<typeof zAttackOrSkillRoll>;
export const zAttackOrSkillRoll = zBaseRoll.extend({
	type: z.enum([RollTypeEnum.attack, RollTypeEnum.skillChallenge]),
	targetDC: z.string().nullable().default(null),
	roll: z.string().default(''),
});
export type DamageRoll = z.infer<typeof zDamageRoll>;
export const zDamageRoll = zBaseRoll.extend({
	type: z.literal(RollTypeEnum.damage),
	damageType: z.string().nullable().default(null),
	healInsteadOfDamage: z.boolean().default(false),
	roll: z.string().nullable().default(null),
});
export type AdvancedDamageRoll = z.infer<typeof zAdvancedDamageRoll>;
export const zAdvancedDamageRoll = zBaseRoll.extend({
	type: z.literal(RollTypeEnum.advancedDamage),
	damageType: z.string().nullable().default(null),
	healInsteadOfDamage: z.boolean().default(false),
	criticalSuccessRoll: z.string().nullable().default(null),
	criticalFailureRoll: z.string().nullable().default(null),
	successRoll: z.string().nullable().default(null),
	failureRoll: z.string().nullable().default(null),
});
export type SaveRoll = z.infer<typeof zSaveRoll>;
export const zSaveRoll = zBaseRoll.extend({
	type: z.literal(RollTypeEnum.save),
	saveRollType: z.string().nullable().default(null),
	saveTargetDC: z.string().nullable().default(null),
});
export type TextRoll = z.infer<typeof zTextRoll>;
export const zTextRoll = zBaseRoll.extend({
	type: z.literal(RollTypeEnum.text),
	defaultText: z.string().nullable().default(null),
	criticalSuccessText: z.string().nullable().default(null),
	criticalFailureText: z.string().nullable().default(null),
	successText: z.string().nullable().default(null),
	failureText: z.string().nullable().default(null),
	extraTags: z.array(z.string()).default([]),
});
export type Roll = z.infer<typeof zRoll>;
export const zRoll = z.discriminatedUnion('type', [
	zAttackOrSkillRoll,
	zDamageRoll,
	zAdvancedDamageRoll,
	zSaveRoll,
	zTextRoll,
]);
