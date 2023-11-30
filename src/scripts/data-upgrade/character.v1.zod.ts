import { z } from 'zod';

const zCharacterData = z
	.union([
		z.object({}),
		z.object({
			id: z.number(),
			userID: z.number(),
			buildID: z.number().nullable().optional(),
			name: z.string(),
			level: z.number(),
			experience: z.number(),
			currentHealth: z.number().nullable().optional(),
			tempHealth: z.number().nullable().optional(),
			heroPoints: z.number().nullable().optional(),
			ancestryID: z.number().nullable().optional(),
			heritageID: z.number().nullable().optional(),
			uniHeritageID: z.number().nullable().optional(),
			backgroundID: z.number().nullable().optional(),
			classID: z.number().nullable().optional(),
			classID_2: z.number().nullable().optional(),
			inventoryID: z.number(),
			notes: z.any(),
			rollHistoryJSON: z.any(),
			details: z.any(),
			customCode: z.any(),
			infoJSON: z
				.object({
					imageURL: z.string().optional(),
					pronouns: z.any().optional(),
				})
				.catchall(z.any())
				.nullable(),
			dataID: z.number().nullable().optional(),
			currentStamina: z.number().nullable().optional(),
			currentResolve: z.number().nullable().optional(),
			builderByLevel: z.number().optional(),
			optionAutoDetectPreReqs: z.number().optional(),
			optionAutoHeightenSpells: z.number().optional(),
			optionPublicCharacter: z.number().optional(),
			optionCustomCodeBlock: z.number().optional(),
			optionDiceRoller: z.number().optional(),
			optionClassArchetypes: z.number().optional(),
			optionIgnoreBulk: z.number().optional(),
			variantProfWithoutLevel: z.number().optional(),
			variantFreeArchetype: z.number().optional(),
			variantAncestryParagon: z.number().optional(),
			variantStamina: z.number().optional(),
			variantAutoBonusProgression: z.number().optional(),
			variantGradualAbilityBoosts: z.number().optional(),
			enabledSources: z.any(),
			enabledHomebrew: z.any(),
			createdAt: z.string(),
			updatedAt: z.string(),
		}),
	])
	.describe("The general character data from the Wanderer's guide API /character endpoint");

const zCalculatedStats = z
	.union([
		z.object({}),
		z.object({
			charID: z.number().optional(),
			maxHP: z.number().nullable().optional(),
			totalClassDC: z.number().nullable().optional(),
			totalSpeed: z.number().nullable().optional(),
			totalAC: z.number().nullable().optional(),
			totalPerception: z.number().nullable().optional(),
			totalSkills: z
				.array(
					z.strictObject({
						Name: z.string(),
						Bonus: z.union([z.string(), z.number()]).nullable(),
					})
				)
				.optional(),
			totalSaves: z
				.array(
					z.strictObject({
						Name: z.string(),
						Bonus: z.union([z.string(), z.number()]).nullable(),
					})
				)
				.optional(),
			totalAbilityScores: z
				.array(
					z.strictObject({
						Name: z.string(),
						Score: z.number().nullable(),
					})
				)
				.optional(),
			weapons: z
				.array(
					z.strictObject({
						Name: z.string(),
						Bonus: z.union([z.string(), z.number()]).nullable().optional(),
						Damage: z.union([z.string(), z.number()]).nullable().optional(),
					})
				)
				.optional(),
			createdAt: z.string().optional(),
			updatedAt: z.string().optional(),
		}),
	])
	.describe(
		"The computed base stat block from the Wanderer's guide API /character/calculated-stats endpoint"
	);

const zBaseRoll = z.strictObject({
	name: z.string(),
	allowRollModifier: z
		.boolean()
		.optional()
		.describe('typo property that made it into sheets. Should be allowRollModifiers'),
	allowRollModifiers: z.boolean().default(false),
});

const zAttackOrSkillRoll = zBaseRoll.extend({
	type: z.enum(['attack', 'skill-challenge']),
	targetDC: z.string().nullable().optional(),
	saveTargetDC: z.string().nullable().optional().describe('invalid property from typo in code'),
	roll: z.string().nullable(),
});
const zDamageRoll = zBaseRoll.extend({
	type: z.literal('damage'),
	damageType: z.string().nullable().optional(),
	healInsteadOfDamage: z.boolean().nullable().optional(),
	roll: z.string().nullable(),
});
const zAdvancedDamageRoll = zBaseRoll.extend({
	type: z.literal('advanced-damage'),
	damageType: z.string().nullable().optional(),
	healInsteadOfDamage: z.boolean().nullable().optional(),
	criticalSuccessRoll: z.string().nullable().optional(),
	criticalFailureRoll: z.string().nullable().optional(),
	successRoll: z.string().nullable().optional(),
	failureRoll: z.string().nullable().optional(),
});
const zSaveRoll = zBaseRoll.extend({
	type: z.literal('save'),
	saveRollType: z.string().nullable().optional(),
	saveTargetDC: z.string().nullable().optional(),
});
const zTextRoll = zBaseRoll.extend({
	type: z.literal('text'),
	defaultText: z.string().nullable().optional(),
	criticalSuccessText: z.string().nullable().optional(),
	criticalFailureText: z.string().nullable().optional(),
	successText: z.string().nullable().optional(),
	failureText: z.string().nullable().optional(),
	extraTags: z.array(z.string()).default([]),
});

export type RollV1 = z.infer<typeof zRollV1>;
export const zRollV1 = z.discriminatedUnion('type', [
	zAttackOrSkillRoll,
	zDamageRoll,
	zAdvancedDamageRoll,
	zSaveRoll,
	zTextRoll,
]);

export type ActionV1 = z.infer<typeof zActionV1>;
export const zActionV1 = z
	.object({
		name: z.string(),
		description: z.string().optional(),
		type: z.string(),
		actionCost: z.string().nullable(),
		baseLevel: z.number().nullable(),
		autoHeighten: z.boolean(),
		tags: z.array(z.string()),
		rolls: z.array(zRollV1),
	})
	.describe('An custom sheet action');

const zAttribute = z.strictObject({
	name: z.string(),
	type: z.string(),
	value: z.number().optional(),
	tags: z.string().array(),
});

export type SheetAdjustmentV1 = z.infer<typeof zSheetAdjustmentV1>;
export const zSheetAdjustmentV1 = z.strictObject({
	property: z.string(),
	operation: z.enum(['+', '-', '=']),
	value: z.string(),
});

export type ModifierV1 = z.infer<typeof zModifierV1>;
export const zModifierV1 = z
	.union([
		z.strictObject({
			name: z.string(),
			isActive: z.boolean(),
			description: z.string().nullable(),
			type: z.string(),
			modifierType: z.enum(['roll']).default('roll'),
			value: z.union([z.number(), z.string()]).optional(),
			targetTags: z.string().nullable().optional(),
			sheetAdjustments: z.null().optional(),
		}),
		z.strictObject({
			name: z.string(),
			isActive: z.boolean(),
			description: z.string().nullable(),
			type: z.string(),
			modifierType: z.enum(['sheet']),
			sheetAdjustments: z.array(zSheetAdjustmentV1).default([]),
		}),
	])
	.describe('A modifier is a bonus or penalty that can be applied to a roll or sheet property.');

export type AttackV1 = z.infer<typeof zAttackV1>;
export const zAttackV1 = z.strictObject({
	name: z.string().describe('The attack name.'),
	toHit: z.string().or(z.number()).nullable().describe('The attack toHit.'),
	damage: z
		.array(
			z
				.object({
					dice: z.string().describe('The attack damage dice.'),
					type: z.string().nullable().optional().describe('The attack damage type.'),
				})
				.describe('A damage roll')
		)
		.describe('The attack damage.'),
	range: z.string().nullable().default(null).describe('The attack range.'),
	traits: z.string().array().default([]).nullable().optional().describe('The attack traits.'),
	notes: z.string().nullable().default(null).describe('The attack notes.'),
});

export type SheetV1 = z.infer<typeof zSheetV1>;
export const zSheetV1 = z
	.object({
		info: z
			.object({
				name: z.string().optional().describe("The character's name."),
				url: z.string().optional().nullable().describe('The url to open the character.'),
				description: z
					.string()
					.optional()
					.nullable()
					.optional()
					.describe("The character's description."),
				gender: z.string().nullable().optional().describe("The character's gender"),
				age: z
					.number()
					.or(z.string())
					.nullable()
					.optional()
					.describe("The character's age"),
				alignment: z.string().nullable().optional().describe("The character's alignment"),
				deity: z.string().nullable().optional().describe("The character's deity"),
				imageURL: z
					.string()
					.nullable()
					.optional()
					.describe("The character's portrait image URL."),
				level: z.number().int().nullable().optional().describe("The character's level."),
				size: z.string().nullable().optional().describe("The character's size category."),
				class: z.string().nullable().optional().describe("The character's class."),
				keyability: z
					.string()
					.nullable()
					.optional()
					.describe("The character's key ability."),
				ancestry: z.string().nullable().optional().describe("The character's ancestry."),
				heritage: z.string().nullable().optional().describe("The character's heritage."),
				background: z
					.string()
					.nullable()
					.optional()
					.describe("The character's background."),
				traits: z.array(z.string()).default([]).describe("The character's traits."),
				usesStamina: z
					.boolean()
					.optional()
					.describe('Whether the character follows alternate stamina rules.'),
			})
			.optional()
			.describe('The general character sheet formation.'),
		abilities: z
			.object({
				strength: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's strength score."),
				dexterity: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's dexterity score."),
				constitution: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's constitution score."),
				intelligence: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's intelligence score."),
				wisdom: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's wisdom score."),
				charisma: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's charisma score."),
			})
			.optional()
			.describe("The character's primary ability scores."),
		general: z
			.object({
				currentHeroPoints: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's current hero points."),
				speed: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's land speed."),
				flySpeed: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's fly speed."),
				swimSpeed: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's swim speed."),
				climbSpeed: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's climb speed."),
				currentFocusPoints: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's current focus points."),
				focusPoints: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's maximum focus points."),
				classDC: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's class DC."),
				classAttack: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's class attack roll."),
				perception: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's perception."),
				perceptionProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's perception proficiency modifier."),
				languages: z
					.array(z.string())
					.default([])
					.describe("The character's spoken languages."),
				senses: z.array(z.string()).default([]).describe("The character's senses."),
			})
			.optional()
			.describe('The general attributes for the character.'),
		defenses: z
			.object({
				currentHp: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's current hit points."),
				maxHp: z
					.number()
					.int()
					.nullable()
					.default(null)
					.describe("The character's maximum hit points."),
				tempHp: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's temporary hit points."),
				currentResolve: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's current resolve points."),
				maxResolve: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's maximum resolve points."),
				currentStamina: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's current stamina points."),
				maxStamina: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's maximum stamina points."),
				immunities: z.array(z.string()).default([]).describe("The character's immunities."),
				resistances: z
					.array(
						z.strictObject({
							amount: z

								.number()
								.int()

								.describe('the amount of resistance for this type of damage'),
							type: z.string().describe("the damage type that's resisted"),
						})
					)
					.default([])
					.describe("The character's resistances."),
				weaknesses: z
					.array(
						z.strictObject({
							amount: z
								.number()
								.int()
								.default(0)
								.describe('the amount of weakness for this type of damage'),
							type: z.string().describe('the damage type that of the weakness'),
						})
					)
					.default([])
					.describe("The character's weaknesses."),
				ac: z
					.number()
					.int()
					.nullable()
					.default(null)
					.describe("The character's armor class"),
				heavyProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's heavy armor proficiency modifier."),
				mediumProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's medium armor proficiency modifier."),
				lightProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's light armor proficiency modifier."),
				unarmoredProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's unarmored proficiency modifier."),
			})
			.optional()
			.describe('The character defensive attributes.'),
		offense: z
			.object({
				martialProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's martial weapon proficiency modifier."),
				simpleProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's simple weapon proficiency modifier."),
				unarmedProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's unarmed weapon proficiency modifier."),
				advancedProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's advanced weapon proficiency modifier."),
			})
			.optional()
			.describe("The character's offensive attributes."),
		castingStats: z
			.object({
				arcaneAttack: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's arcane casting attack bonus."),
				arcaneDC: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's arcane casting DC."),
				arcaneProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's arcane casting proficiency modifier."),
				divineAttack: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's divine casting stat."),
				divineDC: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's divine casting stat."),
				divineProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's divine casting proficiency modifier."),
				occultAttack: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's occult casting stat."),
				occultDC: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's occult casting stat."),
				occultProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's occult casting proficiency modifier."),
				primalAttack: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's primal casting stat."),
				primalDC: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's primal casting stat."),
				primalProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's primal casting proficiency modifier."),
			})
			.optional()
			.describe("The character's casting stats."),
		saves: z
			.object({
				fortitude: z
					.number()
					.int()
					.nullable()
					.default(null)
					.describe("The character's fortitude save."),
				fortitudeProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's fortitude proficiency modifier."),
				reflex: z
					.number()
					.int()
					.nullable()
					.default(null)
					.describe("The character's reflex save."),
				reflexProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's reflex proficiency modifier."),
				will: z
					.number()
					.int()
					.nullable()
					.default(null)
					.describe("The character's will save."),
				willProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's will proficiency modifier."),
			})
			.optional()
			.describe("The character's saving throw attributes."),
		skills: z
			.object({
				acrobatics: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's acrobatics skill."),
				acrobaticsProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's acrobatics proficiency modifier."),
				arcana: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's arcana skill."),
				arcanaProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's arcana proficiency modifier."),
				athletics: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's athletics skill."),
				athleticsProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's athletics proficiency modifier."),
				crafting: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's crafting skill."),
				craftingProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's crafting proficiency modifier."),
				deception: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's deception skill."),
				deceptionProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's deception proficiency modifier."),
				diplomacy: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's diplomacy skill."),
				diplomacyProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's diplomacy proficiency modifier."),
				intimidation: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's intimidation skill."),
				intimidationProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's intimidation proficiency modifier."),
				medicine: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's medicine skill."),
				medicineProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's medicine proficiency modifier."),
				nature: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's nature skill."),
				natureProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's nature proficiency modifier."),
				occultism: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's occultism skill."),
				occultismProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's occultism proficiency modifier."),
				performance: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's performance skill."),
				performanceProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's performance proficiency modifier."),
				religion: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's religion skill."),
				religionProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's religion proficiency modifier."),
				society: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's society skill."),
				societyProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's society proficiency modifier."),
				stealth: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's stealth skill."),
				stealthProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's stealth proficiency modifier."),
				survival: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's survival skill."),
				survivalProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's survival proficiency modifier."),
				thievery: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's thievery skill."),
				thieveryProfMod: z
					.number()
					.int()
					.nullable()
					.optional()
					.describe("The character's thievery proficiency modifier."),
				lores: z
					.array(
						z.strictObject({
							name: z.string().describe('The lore name.'),
							bonus: z.number().int().nullable().describe('The lore bonus.'),
							profMod: z
								.number()
								.nullable()
								.optional()
								.describe('The lore proficiencyModifer.'),
						})
					)
					.default([])
					.describe("The character's lore skills."),
			})
			.optional()
			.describe("The character's skill attributes."),
		attacks: z.array(zAttackV1).describe("The character's attacks.").default([]),
		sourceData: z.object({}).describe('The source data the sheet was parsed from').default({}),
		modifiers: z
			.array(zModifierV1)
			.describe(
				'An array of toggleable modifier objects that apply dice expression values to rolls with certain tags.'
			)
			.default([]),
		actions: z
			.array(zActionV1)
			.describe(
				'An array of default actions set up for the user. These allow the user to make certain roll operations as a single command.'
			)
			.default([]),
		rollMacros: z
			.array(
				z.strictObject({
					name: z.string(),
					macro: z.string(),
				})
			)
			.describe(
				'An array of roll macro objects that allow the substituting of saved roll expressions for simple keywords.'
			)
			.default([]),
	})
	.describe('A character or monster sheet.');

export type CharacterV1 = z.infer<typeof zCharacterV1>;
export const zCharacterV1 = z
	.object({
		id: z.number().int().describe('The id of the character record.'),
		name: z.string().describe('The name of the character.'),
		charId: z.number().int().nullable().describe("The external wanderer's guide character id."),
		userId: z.string().describe('The discord id of the user who imported the character'),
		trackerMessageId: z
			.string()
			.describe("The discord id of message set to track this character's stats.")
			.nullable(),
		trackerChannelId: z
			.string()
			.nullable()
			.describe(
				"The discord id of the channel containing the message set to track this character's stats."
			)
			.nullable(),
		trackerGuildId: z
			.string()
			.nullable()
			.describe(
				"The discord id of the guild with the channel set to track this character's stats."
			)
			.nullable(),
		trackerMode: z
			.enum(['counters_only', 'basic_stats', 'full_sheet'])
			.describe(
				"The mode of the tracker message. Either counters_only', 'basic_stats', or 'full_sheet."
			),
		characterData: zCharacterData,
		calculatedStats: zCalculatedStats,
		isActiveCharacter: z
			.boolean()
			.describe(
				"Whether this is the active character for the user's character based commands"
			),
		importSource: z.string().describe('What source website this character was imported from.'),
		createdAt: z
			.string()
			.datetime()
			.describe('When the character was first imported')
			.nullable(),
		lastUpdatedAt: z
			.string()
			.datetime()
			.describe('When the character was last updated')
			.nullable(),
		attributes: z.array(zAttribute).describe('The character attributes.'),
		actions: z.array(zActionV1),
		modifiers: z.array(zModifierV1),
		rollMacros: z.array(z.strictObject({ name: z.string(), macro: z.string() })),
		sheet: zSheetV1,
	})
	.describe('An imported character');
