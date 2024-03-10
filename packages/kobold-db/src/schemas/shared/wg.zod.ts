import { z } from 'zod';
import { zNullableInteger, zTimestamp } from '../lib/helpers.zod.js';

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
