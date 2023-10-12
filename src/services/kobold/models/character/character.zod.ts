import { z } from 'zod';
import { SheetUtils } from '../../../../utils/sheet-utils.js';
import { zStatSchema } from '../../../pf2etools/schemas/index.js';
import { SheetProperties } from '../../../../utils/sheet-properties.js';

const zNullableInteger = z.number().int().nullable().default(null);

/**
 * A record of a set of enum literals to a known, shared type
 */
export const zRecordOf = <T extends Record<string, string>, ZodValueType extends z.ZodTypeAny>(
	obj: T,
	zodValueType: ZodValueType
) => {
	type KeyType = T[keyof T];
	const keys = Object.values(obj);
	return z.object(
		keys.reduce(
			(agg, k) => ({
				...agg,
				[k]: zodValueType,
			}),
			{} as Record<KeyType, ZodValueType>
		)
	);
};

export type AbilityEnum = z.infer<typeof zAbilityEnum>;
const zAbilityEnum = z.enum([
	'strength',
	'dexterity',
	'constitution',
	'intelligence',
	'wisdom',
	'charisma',
]);

export type ProficiencyStat = z.infer<typeof zProficiencyStat>;
export const zProficiencyStat = z.strictObject({
	proficiency: zNullableInteger,
	totalDC: zNullableInteger,
	total: zNullableInteger,
	ability: zAbilityEnum.nullable().default(null),
});

const zTimestamp = z.string().datetime().default(new Date().toISOString());

export type CharacterData = z.infer<typeof zCharacterData>;
// Character data is not strict because it's API generated
// we don't want our character parsing to break if data is added to the API
export const zCharacterData = z
	.strictObject({
		id: z.number(),
		userID: z.number(),
		buildID: zNullableInteger,
		name: z.string(),
		level: z.number(),
		experience: z.number(),
		currentHealth: zNullableInteger,
		tempHealth: zNullableInteger,
		heroPoints: zNullableInteger,
		ancestryID: zNullableInteger,
		heritageID: zNullableInteger,
		uniHeritageID: zNullableInteger,
		backgroundID: zNullableInteger,
		classID: zNullableInteger,
		classID_2: zNullableInteger,
		inventoryID: z.number(),
		notes: z.any(),
		rollHistoryJSON: z.any(),
		details: z.any(),
		customCode: z.any(),
		infoJSON: z
			.strictObject({
				imageURL: z.string().nullable().default(null),
				pronouns: z.any().nullable().default(null),
			})
			.catchall(z.any())
			.nullable()
			.default(null),

		dataID: zNullableInteger,
		currentStamina: zNullableInteger,
		currentResolve: zNullableInteger,
		builderByLevel: zNullableInteger,
		optionAutoDetectPreReqs: zNullableInteger,
		optionAutoHeightenSpells: zNullableInteger,
		optionPublicCharacter: zNullableInteger,
		optionCustomCodeBlock: zNullableInteger,
		optionDiceRoller: zNullableInteger,
		optionClassArchetypes: zNullableInteger,
		optionIgnoreBulk: zNullableInteger,
		variantProfWithoutLevel: zNullableInteger,
		variantFreeArchetype: zNullableInteger,
		variantAncestryParagon: zNullableInteger,
		variantStamina: zNullableInteger,
		variantAutoBonusProgression: zNullableInteger,
		variantGradualAbilityBoosts: zNullableInteger,
		enabledSources: z.any(),
		enabledHomebrew: z.any(),
		createdAt: zTimestamp,
		updatedAt: zTimestamp,
	})
	.describe("The general character data from the Wanderer's guide API /character endpoint");

// Calculated Stats data is not strict because it's API generated
// we don't want our character parsing to break if data is added to the API
export type CalculatedStats = z.infer<typeof zCalculatedStats>;
export const zCalculatedStats = z
	.strictObject({
		charID: zNullableInteger,
		maxHP: zNullableInteger,
		totalClassDC: zNullableInteger,
		totalSpeed: zNullableInteger,
		totalAC: zNullableInteger,
		totalPerception: zNullableInteger,
		totalSkills: z
			.array(
				z.strictObject({
					Name: z.string(),
					Bonus: z.union([z.string(), z.number()]).nullable().default(null),
				})
			)
			.optional(),
		totalSaves: z
			.array(
				z.strictObject({
					Name: z.string(),
					Bonus: z.union([z.string(), z.number()]).nullable().default(null),
				})
			)
			.optional(),
		totalAbilityScores: z
			.array(
				z.strictObject({
					Name: z.string(),
					Score: zNullableInteger,
				})
			)
			.optional(),
		weapons: z
			.array(
				z.strictObject({
					Name: z.string(),
					Bonus: z.union([z.string(), z.number()]).nullable().default(null),
					Damage: z.union([z.string(), z.number()]).nullable().default(null),
				})
			)
			.optional(),
		createdAt: zTimestamp,
		updatedAt: zTimestamp,
	})
	.describe(
		"The computed base stat block from the Wanderer's guide API /character/calculated-stats endpoint"
	);

export type Roll = z.infer<typeof zRoll>;
export const zRoll = z.strictObject({
	name: z.string(),
	allowRollModifiers: z.boolean().default(false),
});
export type AttackOrSkillRoll = z.infer<typeof zAttackOrSkillRoll>;
export const zAttackOrSkillRoll = zRoll.extend({
	type: z.enum(['attack', 'skill-challenge']),
	targetDC: z.string().nullable().default(null),
	roll: z.string().nullable().default(null),
});
export type DamageRoll = z.infer<typeof zDamageRoll>;
export const zDamageRoll = zRoll.extend({
	type: z.literal('damage'),
	damageType: z.string().nullable().default(null),
	healInsteadOfDamage: z.boolean().default(false),
	roll: z.string().nullable().default(null),
});
export type AdvancedDamageRoll = z.infer<typeof zAdvancedDamageRoll>;
export const zAdvancedDamageRoll = zRoll.extend({
	type: z.literal('advanced-damage'),
	damageType: z.string().nullable().default(null),
	healInsteadOfDamage: z.boolean().default(false),
	criticalSuccessRoll: z.string().nullable().default(null),
	criticalFailureRoll: z.string().nullable().default(null),
	successRoll: z.string().nullable().default(null),
	failureRoll: z.string().nullable().default(null),
});
export type SaveRoll = z.infer<typeof zSaveRoll>;
export const zSaveRoll = zRoll.extend({
	type: z.literal('save'),
	saveRollType: z.string().nullable().default(null),
	saveTargetDC: z.string().nullable().default(null),
});
export type TextRoll = z.infer<typeof zTextRoll>;
export const zTextRoll = zRoll.extend({
	type: z.literal('text'),
	defaultText: z.string().nullable().default(null),
	criticalSuccessText: z.string().nullable().default(null),
	criticalFailureText: z.string().nullable().default(null),
	successText: z.string().nullable().default(null),
	failureText: z.string().nullable().default(null),
	extraTags: z.array(z.string()).default([]),
});

export type WeaknessOrResistance = z.infer<typeof zWeakOrResist>;
export const zWeakOrResist = z.strictObject({
	amount: z.number().int().describe('the amount of weakness/resistance for this type of damage'),
	type: z.string().describe('the damage type'),
});

export type Action = z.infer<typeof zAction>;
export const zAction = z
	.strictObject({
		name: z.string(),
		description: z.string(),
		type: z.enum(['attack', 'spell', 'other']),
		actionCost: z.string().nullable().default(null),
		baseLevel: zNullableInteger,
		autoHeighten: z.boolean().default(false),
		tags: z.array(z.string()).default([]),
		rolls: z
			.array(
				z.discriminatedUnion('type', [
					zAttackOrSkillRoll,
					zDamageRoll,
					zAdvancedDamageRoll,
					zSaveRoll,
					zTextRoll,
				])
			)
			.default([]),
	})
	.describe('A custom sheet action');

export type Attribute = z.infer<typeof zAttribute>;
export const zAttribute = z.strictObject({
	name: z.string(),
	type: z.string(),
	value: z.number(),
	tags: z.array(z.string()).default([]),
});

export type RollMacro = z.infer<typeof zRollMacro>;
export const zRollMacro = z.strictObject({
	name: z.string(),
	macro: z.string(),
});

export type SheetAdjustment = z.infer<typeof zSheetAdjustment>;
export const zSheetAdjustment = z.object({
	property: z.string(),
	operation: z.enum(['+', '-', '=']),
	value: z.string(),
});

export type SheetModifier = z.infer<typeof zSheetModifier>;
export const zSheetModifier = z
	.strictObject({
		modifierType: z.literal('sheet'),
		name: z.string(),
		isActive: z.boolean().default(false),
		description: z.string().default(''),
		type: z.string().default('untyped'),
		sheetAdjustments: z.array(zSheetAdjustment).default([]),
	})
	.describe('A sheet modifier. The sheetAdjustments are applied to the sheet.');

export type RollModifier = z.infer<typeof zRollModifier>;
export const zRollModifier = z
	.strictObject({
		modifierType: z.literal('roll'),
		name: z.string(),
		isActive: z.boolean().default(false),
		description: z.string().default(''),
		type: z.string().default('untyped'),
		value: z.coerce.string(),
		targetTags: z.string().nullable(),
	})
	.describe(
		'A roll modifier. The dice expression in value is assigned ' +
			'the type "type" and appled to rolls that match the targetTags expression'
	);

export type Modifier = z.infer<typeof zModifier>;
export const zModifier = z
	.discriminatedUnion('modifierType', [zSheetModifier, zRollModifier])
	.describe('A modifier is a bonus or penalty that can be applied to a roll or sheet property.');

export type AdditionalSkill = z.infer<typeof zAdditionalSkill>;
export const zAdditionalSkill = zStatSchema.extend({
	name: z.string().describe("The skill's name."),
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

export enum SheetIntPropertyKeys {
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

export type SheetIntProperties = z.infer<typeof zSheetIntProperties>;
export const zSheetIntProperties = zRecordOf(SheetIntPropertyKeys, zNullableInteger).describe(
	"The creature's nullable integer properties."
);

export type PreparedCounter = z.infer<typeof zPreparedCounter>;
export const zPreparedCounter = z.strictObject({
	style: z.enum(['prepared']),
	name: z.string(),
	prepared: z.array(z.string()),
	active: z.array(z.boolean()),
	max: zNullableInteger,
	recoverable: z.boolean().default(false),
});

export type NumericCounter = z.infer<typeof zNumericCounter>;
export const zNumericCounter = z.strictObject({
	style: z.enum(['default', 'dots']),
	name: z.string(),
	current: z.number().int(),
	max: zNullableInteger,
	recoverable: z.boolean().default(false),
});

export type Counter = z.infer<typeof zCounter>;
export const zCounter = z.discriminatedUnion('style', [zPreparedCounter, zNumericCounter]);

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
	keyability = 'keyability',
	ancestry = 'ancestry',
	heritage = 'heritage',
	background = 'background',
}
export type SheetInfo = z.infer<typeof zSheetInfo>;
export const zSheetInfo = zRecordOf(SheetInfoKeys, z.string().nullable().default(null)).describe(
	"A sheet's nullable/mutable string information."
);

export enum SheetBaseCounterKeys {
	heroPoints = 'heroPoints',
	focusPoints = 'focusPoints',
	hp = 'hp',
	tempHp = 'tempHp',
	stamina = 'stamina',
	resolve = 'resolve',
}

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

export enum SheetInfoListKeys {
	traits = 'traits',
	languages = 'languages',
	senses = 'senses',
	immunities = 'immunities',
}

export type SheetInfoLists = z.infer<typeof zSheetInfoLists>;
export const zSheetInfoLists = zRecordOf(
	SheetInfoListKeys,
	z.array(z.string()).default([])
).describe('Sheet information as arrays of strings.');

export enum SheetWeaknessesResistancesKeys {
	resistances = 'resistances',
	weaknesses = 'weaknesses',
}

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
		intProperties: zSheetIntProperties.describe('All nullable integer properties of a sheet.'),
		stats: zSheetStats,
		baseCounters: zSheetBaseCounters.describe('All incrementable counters on a sheet'),
		additionalSkills: z
			.array(zAdditionalSkill)
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

export type Character = z.infer<typeof zCharacter>;
export const zCharacter = z
	.strictObject({
		id: z.number().int().describe('The id of the character record.'),
		name: z.string().describe('The name of the character.'),
		charId: z.number().int().nullable().describe("The external wanderer's guide character id."),
		userId: z.string().describe('The discord id of the user who imported the character'),
		trackerMessageId: z
			.string()
			.nullable()
			.default(null)
			.describe("The discord id of message set to track this character's stats."),
		trackerChannelId: z
			.string()
			.nullable()
			.default(null)
			.describe(
				"The discord id of the channel containing the message set to track this character's stats."
			),
		trackerGuildId: z
			.string()
			.nullable()
			.default(null)
			.describe(
				"The discord id of the guild with the channel set to track this character's stats."
			),
		trackerMode: z
			.enum(['counters_only', 'basic_stats', 'full_sheet'])
			.default('full_sheet')
			.describe(
				"The mode of the tracker message. Either counters_only', 'basic_stats', or 'full_sheet."
			),
		isActiveCharacter: z
			.boolean()
			.default(false)
			.describe(
				"Whether this is the active character for the user's character based commands"
			),
		importSource: z.string().describe('What source website this character was imported from.'),
		createdAt: zTimestamp.describe('When the character was first imported'),
		lastUpdatedAt: zTimestamp.describe('When the character was last updated'),
		actions: z.array(zAction).default([]),
		modifiers: z.array(zModifier).default([]),
		rollMacros: z.array(zRollMacro).default([]),
		sheet: zSheet.default(zSheet.parse(SheetProperties.defaultSheet)),
	})
	.describe('An imported character');
