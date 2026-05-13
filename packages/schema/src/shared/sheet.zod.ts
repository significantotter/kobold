import { z } from 'zod';
import { zNullableInteger, zRecordOf } from '../lib/helpers.zod.js';
import {
	Counter,
	CounterGroup,
	CounterStyleEnum,
	zCounter,
	zCounterGroup,
	zNumericCounter,
} from './counter.zod.js';

export enum AbilityEnum {
	strength = 'strength',
	dexterity = 'dexterity',
	constitution = 'constitution',
	intelligence = 'intelligence',
	wisdom = 'wisdom',
	charisma = 'charisma',
}

export enum StatSubGroupEnum {
	proficiency = 'proficiency',
	dc = 'dc',
	bonus = 'bonus',
	ability = 'ability',
}

export enum SheetIntegerKeys {
	// AC
	ac = 'ac',
	// Ability Scores
	strength = 'strength',
	dexterity = 'dexterity',
	constitution = 'constitution',
	intelligence = 'intelligence',
	wisdom = 'wisdom',
	charisma = 'charisma',
	// Speeds
	walkSpeed = 'walkSpeed',
	flySpeed = 'flySpeed',
	swimSpeed = 'swimSpeed',
	climbSpeed = 'climbSpeed',
	burrowSpeed = 'burrowSpeed',
	dimensionalSpeed = 'dimensionalSpeed',
	// Extra Proficiencies
	heavyProficiency = 'heavyProficiency',
	mediumProficiency = 'mediumProficiency',
	lightProficiency = 'lightProficiency',
	unarmoredProficiency = 'unarmoredProficiency',
	martialProficiency = 'martialProficiency',
	simpleProficiency = 'simpleProficiency',
	unarmedProficiency = 'unarmedProficiency',
	advancedProficiency = 'advancedProficiency',
}

export enum SheetStatKeys {
	// casting
	arcane = 'arcane',
	divine = 'divine',
	occult = 'occult',
	primal = 'primal',
	// Class attack/DC
	class = 'class',
	// perception
	perception = 'perception',
	// saves
	fortitude = 'fortitude',
	reflex = 'reflex',
	will = 'will',
	// skills
	acrobatics = 'acrobatics',
	arcana = 'arcana',
	athletics = 'athletics',
	crafting = 'crafting',
	deception = 'deception',
	diplomacy = 'diplomacy',
	intimidation = 'intimidation',
	medicine = 'medicine',
	nature = 'nature',
	occultism = 'occultism',
	performance = 'performance',
	religion = 'religion',
	society = 'society',
	stealth = 'stealth',
	survival = 'survival',
	thievery = 'thievery',
}

export enum SheetInfoKeys {
	url = 'url',
	description = 'description',
	gender = 'gender',
	age = 'age',
	alignment = 'alignment',
	deity = 'deity',
	imageURL = 'imageURL',
	size = 'size',
	class = 'class',
	ancestry = 'ancestry',
	heritage = 'heritage',
	background = 'background',
}

export enum SheetBaseCounterKeys {
	heroPoints = 'heroPoints',
	focusPoints = 'focusPoints',
	hp = 'hp',
	tempHp = 'tempHp',
	stamina = 'stamina',
	resolve = 'resolve',
}

export enum SheetInfoListKeys {
	traits = 'traits',
	languages = 'languages',
	senses = 'senses',
}

export enum DefenseRuleAutomation {
	auto = 'auto',
	partial = 'partial',
	manual = 'manual',
}

export enum DefenseRuleSource {
	nethys = 'nethys',
	pathbuilder = 'pathbuilder',
	wanderersGuide = 'wanderers-guide',
	manual = 'manual',
}

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

export const zDefenseAppliesTo = z.enum([
	'damage',
	'effect',
	'condition',
	'critical-hit',
	'nonlethal',
]);

export type DefenseMatcher = {
	all?: boolean;
	damageTypes?: string[];
	damageGroups?: Array<'physical'>;
	traits?: string[];
	materials?: string[];
	conditions?: string[];
	effectTypes?: string[];
	except?: Omit<DefenseMatcher, 'except'>;
};
const zDefenseMatcherBase = z.strictObject({
	all: z.boolean().optional(),
	damageTypes: z.array(z.string()).optional(),
	damageGroups: z.array(z.literal('physical')).optional(),
	traits: z.array(z.string()).optional(),
	materials: z.array(z.string()).optional(),
	conditions: z.array(z.string()).optional(),
	effectTypes: z.array(z.string()).optional(),
});
export const zDefenseMatcher: z.ZodType<DefenseMatcher> = zDefenseMatcherBase.extend({
	except: zDefenseMatcherBase.optional(),
});

export type DefenseRule = z.infer<typeof zDefenseRule>;
export const zDefenseRule = z.strictObject({
	label: z.string(),
	raw: z.string(),
	amount: z.number().int().optional(),
	appliesTo: z.array(zDefenseAppliesTo),
	match: zDefenseMatcher,
	automation: z.nativeEnum(DefenseRuleAutomation),
	source: z.nativeEnum(DefenseRuleSource).optional(),
});

export type SheetDefenses = z.infer<typeof zSheetDefenses>;
export const zSheetDefenses = z.strictObject({
	immunities: z.array(zDefenseRule).default([]),
	weaknesses: z.array(zDefenseRule).default([]),
	resistances: z.array(zDefenseRule).default([]),
});

export type DamageTerm = z.infer<typeof zDamageTerm>;
export const zDamageTerm = z.strictObject({
	dice: z.string().nullable().describe('The attack damage dice.'),
	type: z.string().nullable().describe('The attack damage type.'),
	tags: z.array(z.string()).default([]),
	source: z.string().optional(),
	persistent: z.boolean().optional(),
	criticalOnly: z.boolean().optional(),
});

export type Damage = z.infer<typeof zDamage>;
export const zDamage = z
	.strictObject(zDamageTerm.shape)
	.describe('A damage roll');

export type SheetAttack = z.infer<typeof zSheetAttack>;
export const zSheetAttack = z.strictObject({
	name: z.string().describe('The attack name.'),
	toHit: zNullableInteger.describe('The attack toHit.'),
	damage: z.array(zDamage).default([]).describe('The attack damage.'),
	effects: z
		.array(z.string())
		.default([])
		.describe('Any abilities or rider effects to an attack'),
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
		keyAbility: zAbilityEnum.nullable().describe("The creature's key ability."),
		usesStamina: z
			.boolean()
			.default(false)
			.describe('Whether the creature follows alternate stamina rules.'),
	})
	.describe('Sheet information not modifiable in Kobold.');

export type SheetInfo = z.infer<typeof zSheetInfo>;
export const zSheetInfo = zRecordOf(SheetInfoKeys, z.string().nullable().default(null)).describe(
	"A sheet's nullable/mutable string information."
);

export type SheetBaseCounters = z.infer<typeof zSheetBaseCounters>;
export const zSheetBaseCounters = zRecordOf(
	SheetBaseCounterKeys,
	zNumericCounter.default(() => ({
		style: CounterStyleEnum.default as const,
		name: '',
		description: null,
		current: 0,
		max: null,
		recoverTo: -1,
		recoverable: true,
		text: '',
	}))
).describe('The non-configurable base counters for a sheet.');

export type SheetCounterGroups = CounterGroup[];
export const zSheetCounterGroups = zCounterGroup
	.array()
	.describe("The configurable counters for a sheet that aren't in a group.");

export type SheetCountersOutsideGroups = Counter[];
export const zSheetCountersOutsideGroups = zCounter
	.array()
	.describe('The configurable counter groups for a sheet.');

export type SheetInfoLists = z.infer<typeof zSheetInfoLists>;
export const zSheetInfoLists = zRecordOf(
	SheetInfoListKeys,
	z.array(z.string()).default([])
).describe('Sheet information as arrays of strings.');

export type Sheet = z.infer<typeof zSheet>;
export const zSheet = z
	.strictObject({
		staticInfo: zSheetStaticInfo,
		info: zSheetInfo,
		infoLists: zSheetInfoLists,
		defenses: zSheetDefenses,
		intProperties: zSheetIntegers,
		stats: zSheetStats,
		baseCounters: zSheetBaseCounters,
		counterGroups: zSheetCounterGroups,
		countersOutsideGroups: zSheetCountersOutsideGroups,
		additionalSkills: z
			.array(zProficiencyStat)
			.default([])
			.describe("The creature's lore/additional skills."),
		attacks: z.array(zSheetAttack).describe("The creature's attacks."),
	})
	.describe("A creature's sheet.");

export const zPasteBinImport = z.object({
	sheet: zSheet.optional(),
});
