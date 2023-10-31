import { z } from 'zod';
import {
	AbilityEnum,
	SheetIntegerKeys,
	SheetStatKeys,
	SheetInfoKeys,
	SheetBaseCounterKeys,
	SheetInfoListKeys,
	SheetWeaknessesResistancesKeys,
} from '../../schemas/lib/enums.js';
import { zNullableInteger, zRecordOf } from '../../schemas/lib/helpers.zod.js';
import { zAction } from './action.zod.js';
import { zNumericCounter } from './counter.zod.js';
import { zModifier } from './modifier.zod.js';
import { zRollMacro } from './roll-macro.zod.js';

export const zAbilityEnum = z.nativeEnum(AbilityEnum);

export type ProficiencyStat = z.infer<typeof zProficiencyStat>;
export const zProficiencyStat = z.strictObject({
	name: z.string().describe("The stat's name."),
	proficiency: zNullableInteger,
	dc: zNullableInteger,
	bonus: zNullableInteger,
	ability: zAbilityEnum.nullable().default(null),
	note: z.string().nullable().default(null),
});

export type WeaknessOrResistance = z.infer<typeof zWeakOrResist>;
export const zWeakOrResist = z.strictObject({
	amount: z.number().int().describe('the amount of weakness/resistance for this type of damage'),
	type: z.string().describe('the damage type'),
});

export type Damage = z.infer<typeof zDamage>;
export const zDamage = z
	.strictObject({
		dice: z.string().describe('The attack damage dice.'),
		type: z.string().nullable().describe('The attack damage type.'),
	})
	.describe('A damage roll');

export type SheetAttack = z.infer<typeof zSheetAttack>;
export const zSheetAttack = z.strictObject({
	name: z.string().describe('The attack name.'),
	toHit: zNullableInteger.describe('The attack toHit.'),
	damage: z.array(zDamage).default([]).describe('The attack damage.'),
	range: z.string().nullable().default(null).describe('The attack range.'),
	traits: z.string().array().default([]).describe('The attack traits.'),
	notes: z.string().nullable().default(null).describe('The attack notes.'),
});

export type SheetIntegers = z.infer<typeof zSheetIntegers>;
export const zSheetIntegers = zRecordOf(SheetIntegerKeys, zNullableInteger).describe(
	"The creature's nullable integer properties."
);

export type SheetStats = z.infer<typeof zSheetStats>;
export const zSheetStats = zRecordOf(SheetStatKeys, zProficiencyStat).describe(
	'All stats, each potentially having a roll, a dc, a proficiency, and an ability.'
);

export type SheetStaticInfo = z.infer<typeof zSheetStaticInfo>;
export const zSheetStaticInfo = z
	.strictObject({
		name: z.string().describe("The creature's name."),
		level: zNullableInteger.describe("The creature's level."),
		usesStamina: z
			.boolean()
			.default(false)
			.describe('Whether the creature follows alternate stamina rules.'),
	})
	.describe("A sheet's special case static information.");

export type SheetInfo = z.infer<typeof zSheetInfo>;
export const zSheetInfo = zRecordOf(SheetInfoKeys, z.string().nullable().default(null)).describe(
	"A sheet's nullable/mutable string information."
);

export type SheetBaseCounters = z.infer<typeof zSheetBaseCounters>;
export const zSheetBaseCounters = zRecordOf(
	SheetBaseCounterKeys,
	zNumericCounter.default(() => ({
		style: 'default' as const,
		name: '',
		current: 0,
		max: null,
		recoverable: true,
	}))
).describe('The non-configurable base counters for a sheet.');

export type SheetInfoLists = z.infer<typeof zSheetInfoLists>;
export const zSheetInfoLists = zRecordOf(
	SheetInfoListKeys,
	z.array(z.string()).default([])
).describe('Sheet information as arrays of strings.');

export type SheetWeaknessesResistances = z.infer<typeof zSheetWeaknessesResistances>;
export const zSheetWeaknessesResistances = zRecordOf(
	SheetWeaknessesResistancesKeys,
	z.array(zWeakOrResist).default([])
).describe('Weakness or resistance typed information.');

export type Sheet = z.infer<typeof zSheet>;
export const zSheet = z
	.strictObject({
		staticInfo: zSheetStaticInfo.describe('Sheet information not modifiable in Kobold'),
		info: zSheetInfo.describe('Textual sheet information'),
		infoLists: zSheetInfoLists,
		weaknessesResistances: zSheetWeaknessesResistances,
		intProperties: zSheetIntegers.describe('All nullable integer properties of a sheet.'),
		stats: zSheetStats,
		baseCounters: zSheetBaseCounters.describe('All incrementable counters on a sheet'),
		additionalSkills: z
			.array(zProficiencyStat)
			.default([])
			.describe("The creature's lore/additional skills."),
		attacks: z.array(zSheetAttack).describe("The creature's attacks."),
		sourceData: z.any().default({}).describe('The source data the sheet was parsed from'),
		modifiers: z
			.array(zModifier)
			.default([])
			.describe(
				'An array of toggleable modifier strictObjects that apply dice expression values to rolls with certain tags.'
			),
		actions: z
			.array(zAction)
			.default([])
			.describe(
				'An array of default actions set up for the user. These allow the user to make certain roll operations as a single command.'
			),
		rollMacros: z
			.array(zRollMacro)
			.default([])
			.describe(
				'An array of roll macro strictObjects that allow the substituting of saved roll expressions for simple keywords.'
			),
	})
	.describe("A creature's sheet.");
