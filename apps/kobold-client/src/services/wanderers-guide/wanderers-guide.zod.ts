import { z } from 'zod';
import { WG } from './wanderers-guide.d.js';

export const zWgCharacterApiResponseSchema = z.object({
	id: z.number(),
	userID: z.number(),
	buildID: z.number().nullable(),
	name: z.string(),
	level: z.number(),
	experience: z.number(),
	currentHealth: z.number().nullable(),
	tempHealth: z.number().nullable(),
	heroPoints: z.number().nullable(),
	ancestryID: z.number().nullable(),
	heritageID: z.number().nullable(),
	uniHeritageID: z.number().nullable(),
	backgroundID: z.number().nullable(),
	classID: z.number().nullable(),
	classID_2: z.number().nullable(),
	inventoryID: z.number(),
	notes: z.any(),
	infoJSON: z
		.object({
			gender: z.string().optional(),
			beliefs: z.string().optional(),
			appearance: z.string().optional(),
			nationality: z.string().optional(),
			alignment: z.string().optional(),
			imageURL: z.string().optional(),
			pronouns: z.string().optional(),
		})
		.nullable(),
	rollHistoryJSON: z.any(),
	details: z.any(),
	customCode: z.any(),
	dataID: z.number().nullable(),
	currentStamina: z.number().nullable(),
	currentResolve: z.number().nullable(),
	builderByLevel: z.number(),
	optionAutoDetectPreReqs: z.number(),
	optionAutoHeightenSpells: z.number(),
	optionPublicCharacter: z.number(),
	optionCustomCodeBlock: z.number(),
	optionDiceRoller: z.number(),
	optionClassArchetypes: z.number(),
	optionIgnoreBulk: z.number(),
	variantProfWithoutLevel: z.number(),
	variantFreeArchetype: z.number(),
	variantAncestryParagon: z.number(),
	variantStamina: z.number(),
	variantAutoBonusProgression: z.number(),
	variantGradualAbilityBoosts: z.number(),
	enabledSources: z.array(z.string()),
	enabledHomebrew: z.array(z.any()),
	createdAt: z.string(),
	updatedAt: z.string(),
});
const _wgCharacterApiResponseSchemaTypeCheck: WG.CharacterApiResponse =
	zWgCharacterApiResponseSchema._type;

export const zWgSrcStructSchema = z.object({
	charID: z.number(),
	source: z.string(),
	sourceType: z.string(),
	sourceLevel: z.number(),
	sourceCode: z.string(),
	sourceCodeSNum: z.string(),
	value: z.any(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgSpellSlotSchema = z.object({
	slotID: z.number(),
	slotLevel: z.number(),
	used: z.boolean(),
	spellID: z.number().nullable(),
	type: z.string(),
	level_lock: z.number(),
	srcStruct: zWgSrcStructSchema,
});

export const zWgSpellSlotsMapSchema = z.record(z.any());

export const zWgSpellSchema = z.object({
	SpellBookSpellID: z.number(),
	SpellID: z.number(),
	SpellLevel: z.number(),
	SpellType: z.string(),
});

export const zWgSpellBookSchema = z.object({
	SpellSRC: z.string(),
	SpellList: z.string(),
	SpellCastingType: z.string(),
	SpellKeyAbility: z.string(),
	IsFocus: z.boolean(),
	SpellBook: z.array(zWgSpellSchema),
});

export const zWgInnateSpellSchema = z.object({
	charID: z.number(),
	source: z.string(),
	sourceType: z.string(),
	sourceLevel: z.number(),
	sourceCode: z.string(),
	sourceCodeSNum: z.string(),
	value: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
	SpellID: z.string(),
	SpellLevel: z.number(),
	SpellTradition: z.string(),
	TimesPerDay: z.number(),
	KeyAbility: z.string(),
	TimesCast: z.number(),
});

export const zWgFocusSpellSchema = z.object({
	charID: z.number(),
	source: z.string(),
	sourceType: z.string(),
	sourceLevel: z.number(),
	sourceCode: z.string(),
	sourceCodeSNum: z.string(),
	value: z.any(),
	createdAt: z.string(),
	updatedAt: z.string(),
	SpellID: z.string(),
});

export const zWgFocusSpellsMapSchema = z.record(z.any());

export const zWgCharacterSpellApiResponseSchema = z.object({
	spell_slots_map: zWgSpellSlotsMapSchema,
	spell_books: z.array(zWgSpellBookSchema),
	innate_spells: zWgInnateSpellSchema,
	focus_spells_map: zWgFocusSpellsMapSchema,
	focus_points: z.array(zWgSrcStructSchema),
});

export const zWgNamedScoreSchema = z.object({
	Name: z.string(),
	Score: z.number().nullable(),
});

export const zWgNamedBonusSchema = z.object({
	Name: z.string(),
	Bonus: z.union([z.number(), z.string()]).nullable(),
	ProficiencyMod: z.number().optional().nullable(),
});

export const zWgAttackSchema = z.object({
	Name: z.string(),
	Bonus: z.number().nullable(),
	Damage: z.string().nullable(),
});

export const zWgCalculatedConditionSchema = z.object({
	conditionID: z.number().nullable(),
	name: z.string().nullable(),
	entryID: z.number().nullable(),
	parentEntryID: z.number().nullable(),
	sourceText: z.any(),
	value: z.number().nullable(),
});

export const zWgCharacterCalculatedStatsApiResponseSchema = z.object({
	charID: z.number(),
	maxHP: z.number().nullable(),
	maxStamina: z.number().nullable(),
	maxResolve: z.number().nullable(),
	conditions: z.array(zWgCalculatedConditionSchema).nullable(),
	totalClassDC: z.number().nullable(),
	classDCProfMod: z.number().optional().nullable(),
	totalSpeed: z.number().nullable(),
	generalInfo: z.object({
		className: z.string().optional(),
		heritageAncestryName: z.string().optional(),
		backgroundName: z.string().optional(),
		size: z.string().optional(),
		traits: z.array(z.string()).optional(),
	}),
	totalAC: z.number().nullable(),
	totalPerception: z.number().nullable(),
	perceptionProfMod: z.number().optional().nullable(),
	totalSkills: z.array(zWgNamedBonusSchema),
	totalSaves: z.array(zWgNamedBonusSchema),
	totalAbilityScores: z.array(zWgNamedScoreSchema),
	weapons: z.array(zWgAttackSchema),
	unarmedProfMod: z.number().optional().nullable(),
	simpleWeaponProfMod: z.number().optional().nullable(),
	martialWeaponProfMod: z.number().optional().nullable(),
	advancedWeaponProfMod: z.number().optional().nullable(),
	arcaneSpellDC: z.number().optional().nullable(),
	divineSpellDC: z.number().optional().nullable(),
	occultSpellDC: z.number().optional().nullable(),
	primalSpellDC: z.number().optional().nullable(),
	arcaneSpellAttack: z.number().optional().nullable(),
	divineSpellAttack: z.number().optional().nullable(),
	occultSpellAttack: z.number().optional().nullable(),
	primalSpellAttack: z.number().optional().nullable(),
	arcaneSpellProfMod: z.number().optional().nullable(),
	divineSpellProfMod: z.number().optional().nullable(),
	occultSpellProfMod: z.number().optional().nullable(),
	primalSpellProfMod: z.number().optional().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgInventoryMetadataSchema = z.object({
	id: z.number(),
	equippedArmorInvItemID: z.number().nullable(),
	equippedShieldInvItemID: z.number().nullable(),
	equippedArmorCategory: z.string().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgInventoryItemSchema = z.object({
	id: z.number(),
	invID: z.number(),
	itemID: z.number(),
	name: z.string(),
	price: z.number(),
	bulk: z.number(),
	description: z.string().nullable(),
	size: z.string(),
	quantity: z.number(),
	isShoddy: z.number(),
	isDropped: z.number(),
	currentHitPoints: z.number(),
	hitPoints: z.number(),
	materialType: z.string().nullable(),
	brokenThreshold: z.number(),
	hardness: z.number(),
	code: z.any().nullable(),
	itemTags: z.any().nullable(),
	isInvested: z.number(),
	bagInvItemID: z.any().nullable(),
	itemIsWeapon: z.number(),
	itemWeaponDieType: z.any().nullable(),
	itemWeaponDamageType: z.any().nullable(),
	itemWeaponRange: z.any().nullable(),
	itemWeaponReload: z.any().nullable(),
	itemWeaponAtkBonus: z.number(),
	itemWeaponDmgBonus: z.number(),
	itemIsStorage: z.number(),
	itemStorageMaxBulk: z.number(),
	fundRuneID: z.any().nullable(),
	fundPotencyRuneID: z.any().nullable(),
	propRune1ID: z.any().nullable(),
	propRune2ID: z.any().nullable(),
	propRune3ID: z.any().nullable(),
	propRune4ID: z.any().nullable(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgCharacterInventoryApiResponseSchema = z.object({
	Inventory: zWgInventoryMetadataSchema,
	InvItems: z.array(zWgInventoryItemSchema),
});

export const zWgConditionSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().nullable(),
	hasValue: z.number(),
	code: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgConditionEntrySchema = z.object({
	EntryID: z.number(),
	Value: z.number().nullable(),
	SourceText: z.string().nullable(),
	ParentID: z.number(),
});

export const zWgCharacterConditionsApiResponseSchema = z.record(z.any());

export const zWgCharacterMetadataApiResponseItemSchema = z.object({
	charID: z.number(),
	source: z.string(),
	sourceType: z.string(),
	sourceLevel: z.number(),
	sourceCode: z.string(),
	sourceCodeSNum: z.string(),
	value: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgCharacterMetadataApiResponseSchema = z.object({});

export const zWgClassFeatureSchema = z.object({
	id: z.number(),
	classID: z.number(),
	name: z.string(),
	level: z.any(),
	description: z.string().nullable(),
	code: z.string(),
	selectType: z.string(),
	selectOptionFor: z.number(),
	displayInSheet: z.number(),
	indivClassName: z.any(),
	indivClassAbilName: z.any(),
	isArchived: z.number(),
	contentSrc: z.string(),
	homebrewID: z.any(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgClassApiResponseSchema = z.object({
	class: z.object({
		id: z.number(),
		name: z.string(),
		rarity: z.string(),
		description: z.string().nullable(),
		keyAbility: z.string(),
		hitPoints: z.number(),
		tPerception: z.string(),
		tFortitude: z.string(),
		tReflex: z.string(),
		tWill: z.string(),
		tClassDC: z.string(),
		tSkills: z.string(),
		tSkillsMore: z.number(),
		tWeapons: z.string(),
		weaponsExtra: z.any(),
		tArmor: z.string(),
		tagID: z.number(),
		artworkURL: z.string(),
		code: z.any(),
		isArchived: z.number(),
		contentSrc: z.string(),
		homebrewID: z.any(),
		version: z.string(),
		createdAt: z.string(),
		updatedAt: z.string(),
	}),
	class_features: z.array(zWgClassFeatureSchema),
});

export const zWgClassApiMapResponseSchema = z.record(z.any());

export const zWgAncestryHeritageSchema = z.object({
	id: z.number(),
	name: z.string(),
	ancestryID: z.number().optional(),
	tagId: z.number().optional(),
	rarity: z.string(),
	description: z.string().nullable(),
	code: z.string(),
	isArchived: z.number(),
	contentSrc: z.string(),
	indivAncestryName: z.any().optional(),
	homebrewID: z.any(),
	artworkURL: z.string().optional().nullable(),
	version: z.string().optional(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgLanguageSchema = z.object({
	id: z.number(),
	name: z.string(),
	speakers: z.string(),
	script: z.any(),
	description: z.string().nullable(),
	homebrewID: z.any(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgAncestryFeatureSchema = z.object({
	id: z.number(),
	name: z.string(),
	description: z.string().nullable(),
	code: z.string(),
	itemWeaponID: z.any(),
	overrides: z.any(),
});

export const zWgAncestrySchema = z.object({
	id: z.number(),
	name: z.string(),
	rarity: z.string(),
	hitPoints: z.number(),
	size: z.string(),
	speed: z.number(),
	description: z.string(),
	visionSenseID: z.number(),
	additionalSenseID: z.any(),
	physicalFeatureOneID: z.number(),
	physicalFeatureTwoID: z.number(),
	tagID: z.number(),
	artworkURL: z.any(),
	isArchived: z.number(),
	contentSrc: z.string(),
	homebrewID: z.any(),
	version: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgAncestryApiResponseSchema = z.object({
	ancestry: zWgAncestrySchema,
	heritages: z.array(zWgAncestryHeritageSchema),
	languages: z.array(zWgLanguageSchema),
	bonus_languages: z.array(zWgLanguageSchema),
	boosts: z.array(z.string()),
	flaws: z.array(z.string()),
	vision_sense: z.object({
		id: z.number(),
		name: z.string(),
		description: z.string().nullable(),
		isVisionType: z.number(),
		visionPrecedence: z.number(),
		createdAt: z.string(),
		updatedAt: z.string(),
	}),
	additional_sense: z.null(),
	physical_feature_one: zWgAncestryFeatureSchema,
	physical_feature_two: zWgAncestryFeatureSchema,
});

export const zWgAncestryApiMapResponseSchema = z.record(z.any());

export const zWgVHeritageApiResponseSchema = z.object({
	heritage: zWgAncestryHeritageSchema,
});

export const zWgBackgroundSchema = z.object({
	id: z.number(),
	name: z.string(),
	rarity: z.string(),
	description: z.string().nullable(),
	boostOne: z.string(),
	boostTwo: z.string(),
	code: z.string(),
	isArchived: z.number(),
	contentSrc: z.string(),
	homebrewID: z.any(),
	version: z.string(),
	createdAt: z.string(),
	updatedAt: z.string(),
});

export const zWgBackgroundApiResponseSchema = z.object({
	background: zWgBackgroundSchema,
});
