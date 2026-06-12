import { z } from 'zod';
import { SheetAdjustmentTypeEnum, zSheetAdjustment } from './sheet-adjustment.zod.js';
import { zDamageTerm } from './sheet.zod.js';

export enum RollTypeEnum {
	attack = 'attack',
	skillChallenge = 'skill-challenge',
	damage = 'damage',
	AdvancedDamage = 'advanced-damage',
	save = 'save',
	text = 'text',
	effect = 'effect',
}

export enum ActionEffectTriggerEnum {
	criticalSuccess = 'critical success',
	success = 'success',
	failure = 'failure',
	criticalFailure = 'critical failure',
	successOrBetter = 'success or better',
	failureOrWorse = 'failure or worse',
	any = 'any',
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
	terms: z.array(zDamageTerm).default([]),
});
export type AdvancedDamageRoll = z.infer<typeof zAdvancedDamageRoll>;
export const zAdvancedDamageRoll = zBaseRoll.extend({
	type: z.literal(RollTypeEnum.AdvancedDamage),
	criticalSuccessTerms: z.array(zDamageTerm).default([]),
	successTerms: z.array(zDamageTerm).default([]),
	failureTerms: z.array(zDamageTerm).default([]),
	criticalFailureTerms: z.array(zDamageTerm).default([]),
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
const zEffectCondition = z.strictObject({
	description: z.string().nullable().optional(),
	isActive: z.boolean().default(true),
	name: z.string(),
	note: z.string().nullable().optional(),
	rollAdjustment: z.string().nullable().optional(),
	rollTargetTags: z.string().nullable().optional(),
	severity: z.number().nullable().optional(),
	sheetAdjustments: z.array(zSheetAdjustment).default([]),
	type: z.enum(SheetAdjustmentTypeEnum).default(SheetAdjustmentTypeEnum.untyped),
});
export type EffectRoll = z.infer<typeof zEffectRoll>;
export const zEffectRoll = zBaseRoll.extend({
	type: z.literal(RollTypeEnum.effect),
	trigger: z.enum(ActionEffectTriggerEnum).default(ActionEffectTriggerEnum.any),
	condition: zEffectCondition,
});
export type Roll = z.infer<typeof zRoll>;
export const zRoll = z.discriminatedUnion('type', [
	zAttackOrSkillRoll,
	zDamageRoll,
	zAdvancedDamageRoll,
	zSaveRoll,
	zTextRoll,
	zEffectRoll,
]);
