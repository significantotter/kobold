import { z } from 'zod';
import { SheetUtils } from '../../../../utils/sheet-utils.js';

export const zCharacterData = z
	.object({
		id: z.number(),
		userID: z.number(),
		buildID: z.union([z.null(), z.number()]).optional(),
		name: z.string(),
		level: z.number(),
		experience: z.number(),
		currentHealth: z.union([z.null(), z.number()]).optional(),
		tempHealth: z.union([z.null(), z.number()]).optional(),
		heroPoints: z.union([z.null(), z.number()]).optional(),
		ancestryID: z.union([z.null(), z.number()]).optional(),
		heritageID: z.union([z.null(), z.number()]).optional(),
		uniHeritageID: z.union([z.null(), z.number()]).optional(),
		backgroundID: z.union([z.null(), z.number()]).optional(),
		classID: z.union([z.null(), z.number()]).optional(),
		classID_2: z.union([z.null(), z.number()]).optional(),
		inventoryID: z.number(),
		notes: z.any(),
		rollHistoryJSON: z.any(),
		details: z.any(),
		customCode: z.any(),
		infoJSON: z.union([
			z.null(),
			z
				.object({
					imageURL: z.string().optional(),
					pronouns: z.any().optional(),
				})
				.catchall(z.any()),
		]),
		dataID: z.union([z.null(), z.number()]).optional(),
		currentStamina: z.union([z.null(), z.number()]).optional(),
		currentResolve: z.union([z.null(), z.number()]).optional(),
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
	})
	.describe("The general character data from the Wanderer's guide API /character endpoint");

export const zCalculatedStats = z
	.object({
		charID: z.number().optional(),
		maxHP: z.union([z.number(), z.null()]).optional(),
		totalClassDC: z.union([z.number(), z.null()]).optional(),
		totalSpeed: z.union([z.number(), z.null()]).optional(),
		totalAC: z.union([z.number(), z.null()]).optional(),
		totalPerception: z.union([z.number(), z.null()]).optional(),
		totalSkills: z
			.array(
				z.strictObject({
					Name: z.string(),
					Bonus: z.union([z.string(), z.number(), z.null()]),
				})
			)
			.optional(),
		totalSaves: z
			.array(
				z.strictObject({
					Name: z.string(),
					Bonus: z.union([z.string(), z.number(), z.null()]),
				})
			)
			.optional(),
		totalAbilityScores: z
			.array(
				z.strictObject({
					Name: z.string(),
					Score: z.union([z.number(), z.null()]),
				})
			)
			.optional(),
		weapons: z
			.array(
				z.strictObject({
					Name: z.string(),
					Bonus: z.union([z.string(), z.number(), z.null()]).optional(),
					Damage: z.union([z.string(), z.number(), z.null()]).optional(),
				})
			)
			.optional(),
		createdAt: z.string().optional(),
		updatedAt: z.string().optional(),
	})
	.describe(
		"The computed base stat block from the Wanderer's guide API /character/calculated-stats endpoint"
	);

const zRoll = z.strictObject({
	name: z.string(),
	allowRollModifiers: z.boolean().default(false),
});

const zAttackOrSkillRoll = zRoll.extend({
	type: z.enum(['attack', 'skill-challenge']),
	targetDC: z.union([z.string(), z.null()]).optional(),
	roll: z.union([z.string(), z.null()]),
});
const zDamageRoll = zRoll.extend({
	type: z.literal('damage'),
	damageType: z.union([z.string(), z.null()]).optional(),
	healInsteadOfDamage: z.union([z.boolean(), z.null()]).optional(),
	roll: z.union([z.string(), z.null()]),
});
const zAdvancedDamageRoll = zRoll.extend({
	type: z.literal('advanced-damage'),
	damageType: z.union([z.string(), z.null()]).optional(),
	healInsteadOfDamage: z.union([z.boolean(), z.null()]).optional(),
	criticalSuccessRoll: z.union([z.string(), z.null()]).optional(),
	criticalFailureRoll: z.union([z.string(), z.null()]).optional(),
	successRoll: z.union([z.string(), z.null()]).optional(),
	failureRoll: z.union([z.string(), z.null()]).optional(),
});
const zSaveRoll = zRoll.extend({
	type: z.literal('save'),
	saveRollType: z.union([z.string(), z.null()]).optional(),
	saveTargetDC: z.union([z.string(), z.null()]).optional(),
});
const zTextRoll = zRoll.extend({
	type: z.literal('text'),
	defaultText: z.union([z.string(), z.null()]).optional(),
	criticalSuccessText: z.union([z.string(), z.null()]).optional(),
	criticalFailureText: z.union([z.string(), z.null()]).optional(),
	successText: z.union([z.string(), z.null()]).optional(),
	failureText: z.union([z.string(), z.null()]).optional(),
	extraTags: z.array(z.string()).default([]),
});

export const zAction = z
	.object({
		name: z.string(),
		description: z.string(),
		type: z.string(),
		actionCost: z.union([z.string(), z.null()]),
		baseLevel: z.union([z.number(), z.null()]),
		autoHeighten: z.boolean(),
		tags: z.array(z.string()),
		rolls: z.array(
			z.discriminatedUnion('type', [
				zAttackOrSkillRoll,
				zDamageRoll,
				zAdvancedDamageRoll,
				zSaveRoll,
				zTextRoll,
			])
		),
	})
	.describe('An custom sheet action');

const zAttribute = z.strictObject({
	name: z.string(),
	type: z.string(),
	value: z.number(),
	tags: z.string().array(),
});

const zModifier = z
	.record(z.any())
	.and(
		z.intersection(
			z.strictObject({
				name: z.string(),
				isActive: z.boolean(),
				description: z.union([z.string(), z.null()]),
				type: z.string(),
			}),
			z.any().superRefine((x, ctx) => {
				const schemas = [z.any(), z.any()];
				const errors = schemas.reduce(
					(errors: z.ZodError[], schema) =>
						(result => ('error' in result ? [...errors, result.error] : errors))(
							schema.safeParse(x)
						),
					[]
				);
				if (schemas.length - errors.length !== 1) {
					ctx.addIssue({
						path: ctx.path,
						code: 'invalid_union',
						unionErrors: errors,
						message: 'Invalid input: Should pass single schema',
					});
				}
			})
		)
	)
	.describe('A modifier is a bonus or penalty that can be applied to a roll or sheet property.');

export const zSheet = z
	.object({
		info: z
			.object({
				name: z.string().describe("The character's name."),
				url: z
					.union([
						z.string().describe('The url to open the character.'),
						z.null().describe('The url to open the character.'),
					])
					.describe('The url to open the character.'),
				description: z
					.union([
						z.string().describe("The character's description."),
						z.null().describe("The character's description."),
					])
					.describe("The character's description."),
				gender: z
					.union([
						z.string().describe("The character's gender"),
						z.null().describe("The character's gender"),
					])
					.describe("The character's gender"),
				age: z
					.union([
						z.number().describe("The character's age"),
						z.null().describe("The character's age"),
					])
					.describe("The character's age"),
				alignment: z
					.union([
						z.string().describe("The character's alignment"),
						z.null().describe("The character's alignment"),
					])
					.describe("The character's alignment"),
				deity: z
					.union([
						z.string().describe("The character's deity"),
						z.null().describe("The character's deity"),
					])
					.describe("The character's deity"),
				imageURL: z
					.union([
						z.string().describe("The character's portrait image URL."),
						z.null().describe("The character's portrait image URL."),
					])
					.describe("The character's portrait image URL."),
				level: z
					.union([
						z.number().int().describe("The character's level."),
						z.null().describe("The character's level."),
					])
					.describe("The character's level."),
				size: z
					.union([
						z.string().describe("The character's size category."),
						z.null().describe("The character's size category."),
					])
					.describe("The character's size category."),
				class: z
					.union([
						z.string().describe("The character's class."),
						z.null().describe("The character's class."),
					])
					.describe("The character's class."),
				keyability: z
					.union([
						z.string().describe("The character's key ability."),
						z.null().describe("The character's key ability."),
					])
					.describe("The character's key ability."),
				ancestry: z
					.union([
						z.string().describe("The character's ancestry."),
						z.null().describe("The character's ancestry."),
					])
					.describe("The character's ancestry."),
				heritage: z
					.union([
						z.string().describe("The character's heritage."),
						z.null().describe("The character's heritage."),
					])
					.describe("The character's heritage."),
				background: z
					.union([
						z.string().describe("The character's background."),
						z.null().describe("The character's background."),
					])
					.describe("The character's background."),
				traits: z
					.array(z.union([z.string(), z.null()]))
					.describe("The character's traits."),
				usesStamina: z
					.boolean()
					.describe('Whether the character follows alternate stamina rules.'),
			})
			.describe('The general character sheet formation.'),
		abilities: z
			.object({
				strength: z
					.union([
						z.number().int().describe("The character's strength score."),
						z.null().describe("The character's strength score."),
					])
					.describe("The character's strength score."),
				dexterity: z
					.union([
						z.number().int().describe("The character's dexterity score."),
						z.null().describe("The character's dexterity score."),
					])
					.describe("The character's dexterity score."),
				constitution: z
					.union([
						z.number().int().describe("The character's constitution score."),
						z.null().describe("The character's constitution score."),
					])
					.describe("The character's constitution score."),
				intelligence: z
					.union([
						z.number().int().describe("The character's intelligence score."),
						z.null().describe("The character's intelligence score."),
					])
					.describe("The character's intelligence score."),
				wisdom: z
					.union([
						z.number().int().describe("The character's wisdom score."),
						z.null().describe("The character's wisdom score."),
					])
					.describe("The character's wisdom score."),
				charisma: z
					.union([
						z.number().int().describe("The character's charisma score."),
						z.null().describe("The character's charisma score."),
					])
					.describe("The character's charisma score."),
			})
			.describe("The character's primary ability scores."),
		general: z
			.object({
				currentHeroPoints: z
					.union([
						z.number().int().describe("The character's current hero points."),
						z.null().describe("The character's current hero points."),
					])
					.describe("The character's current hero points."),
				speed: z
					.union([
						z.number().int().describe("The character's land speed."),
						z.null().describe("The character's land speed."),
					])
					.describe("The character's land speed."),
				flySpeed: z
					.union([
						z.number().int().describe("The character's fly speed."),
						z.null().describe("The character's fly speed."),
					])
					.describe("The character's fly speed."),
				swimSpeed: z
					.union([
						z.number().int().describe("The character's swim speed."),
						z.null().describe("The character's swim speed."),
					])
					.describe("The character's swim speed."),
				climbSpeed: z
					.union([
						z.number().int().describe("The character's climb speed."),
						z.null().describe("The character's climb speed."),
					])
					.describe("The character's climb speed."),
				currentFocusPoints: z
					.union([
						z.number().int().describe("The character's current focus points."),
						z.null().describe("The character's current focus points."),
					])
					.describe("The character's current focus points."),
				focusPoints: z
					.union([
						z.number().int().describe("The character's maximum focus points."),
						z.null().describe("The character's maximum focus points."),
					])
					.describe("The character's maximum focus points."),
				classDC: z
					.union([
						z.number().int().describe("The character's class DC."),
						z.null().describe("The character's class DC."),
					])
					.describe("The character's class DC."),
				classAttack: z
					.union([
						z.number().int().describe("The character's class attack roll."),
						z.null().describe("The character's class attack roll."),
					])
					.describe("The character's class attack roll."),
				perception: z
					.union([
						z.number().int().describe("The character's perception."),
						z.null().describe("The character's perception."),
					])
					.describe("The character's perception."),
				perceptionProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's perception proficiency modifier."),
						z.null().describe("The character's perception proficiency modifier."),
					])
					.describe("The character's perception proficiency modifier."),
				languages: z
					.array(z.union([z.string(), z.null()]))
					.describe("The character's spoken languages."),
				senses: z
					.array(z.union([z.string(), z.null()]))
					.describe("The character's senses."),
			})
			.describe('The general attributes for the character.'),
		defenses: z
			.object({
				currentHp: z
					.union([
						z.number().int().describe("The character's current hit points."),
						z.null().describe("The character's current hit points."),
					])
					.describe("The character's current hit points."),
				maxHp: z
					.union([
						z.number().int().describe("The character's maximum hit points."),
						z.null().describe("The character's maximum hit points."),
					])
					.describe("The character's maximum hit points."),
				tempHp: z
					.union([
						z.number().int().describe("The character's temporary hit points."),
						z.null().describe("The character's temporary hit points."),
					])
					.describe("The character's temporary hit points."),
				currentResolve: z
					.union([
						z.number().int().describe("The character's current resolve points."),
						z.null().describe("The character's current resolve points."),
					])
					.describe("The character's current resolve points."),
				maxResolve: z
					.union([
						z.number().int().describe("The character's maximum resolve points."),
						z.null().describe("The character's maximum resolve points."),
					])
					.describe("The character's maximum resolve points."),
				currentStamina: z
					.union([
						z.number().int().describe("The character's current stamina points."),
						z.null().describe("The character's current stamina points."),
					])
					.describe("The character's current stamina points."),
				maxStamina: z
					.union([
						z.number().int().describe("The character's maximum stamina points."),
						z.null().describe("The character's maximum stamina points."),
					])
					.describe("The character's maximum stamina points."),
				immunities: z.array(z.string()).describe("The character's immunities."),
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
					.describe("The character's resistances."),
				weaknesses: z
					.array(
						z.strictObject({
							amount: z
								.number()
								.int()
								.describe('the amount of weakness for this type of damage'),
							type: z.string().describe('the damage type that of the weakness'),
						})
					)
					.describe("The character's weaknesses."),
				ac: z
					.union([
						z.number().int().describe("The character's armor class"),
						z.null().describe("The character's armor class"),
					])
					.describe("The character's armor class"),
				heavyProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's heavy armor proficiency modifier."),
						z.null().describe("The character's heavy armor proficiency modifier."),
					])
					.describe("The character's heavy armor proficiency modifier."),
				mediumProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's medium armor proficiency modifier."),
						z.null().describe("The character's medium armor proficiency modifier."),
					])
					.describe("The character's medium armor proficiency modifier."),
				lightProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's light armor proficiency modifier."),
						z.null().describe("The character's light armor proficiency modifier."),
					])
					.describe("The character's light armor proficiency modifier."),
				unarmoredProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's unarmored proficiency modifier."),
						z.null().describe("The character's unarmored proficiency modifier."),
					])
					.describe("The character's unarmored proficiency modifier."),
			})
			.describe('The character defensive attributes.'),
		offense: z
			.object({
				martialProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's martial weapon proficiency modifier."),
						z.null().describe("The character's martial weapon proficiency modifier."),
					])
					.describe("The character's martial weapon proficiency modifier."),
				simpleProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's simple weapon proficiency modifier."),
						z.null().describe("The character's simple weapon proficiency modifier."),
					])
					.describe("The character's simple weapon proficiency modifier."),
				unarmedProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's unarmed weapon proficiency modifier."),
						z.null().describe("The character's unarmed weapon proficiency modifier."),
					])
					.describe("The character's unarmed weapon proficiency modifier."),
				advancedProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's advanced weapon proficiency modifier."),
						z.null().describe("The character's advanced weapon proficiency modifier."),
					])
					.describe("The character's advanced weapon proficiency modifier."),
			})
			.describe("The character's offensive attributes."),
		castingStats: z
			.object({
				arcaneAttack: z
					.union([
						z.number().int().describe("The character's arcane casting attack bonus."),
						z.null().describe("The character's arcane casting attack bonus."),
					])
					.describe("The character's arcane casting attack bonus."),
				arcaneDC: z
					.union([
						z.number().int().describe("The character's arcane casting DC."),
						z.null().describe("The character's arcane casting DC."),
					])
					.describe("The character's arcane casting DC."),
				arcaneProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's arcane casting proficiency modifier."),
						z.null().describe("The character's arcane casting proficiency modifier."),
					])
					.describe("The character's arcane casting proficiency modifier."),
				divineAttack: z
					.union([
						z.number().int().describe("The character's divine casting stat."),
						z.null().describe("The character's divine casting stat."),
					])
					.describe("The character's divine casting stat."),
				divineDC: z
					.union([
						z.number().int().describe("The character's divine casting stat."),
						z.null().describe("The character's divine casting stat."),
					])
					.describe("The character's divine casting stat."),
				divineProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's divine casting proficiency modifier."),
						z.null().describe("The character's divine casting proficiency modifier."),
					])
					.describe("The character's divine casting proficiency modifier."),
				occultAttack: z
					.union([
						z.number().int().describe("The character's occult casting stat."),
						z.null().describe("The character's occult casting stat."),
					])
					.describe("The character's occult casting stat."),
				occultDC: z
					.union([
						z.number().int().describe("The character's occult casting stat."),
						z.null().describe("The character's occult casting stat."),
					])
					.describe("The character's occult casting stat."),
				occultProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's occult casting proficiency modifier."),
						z.null().describe("The character's occult casting proficiency modifier."),
					])
					.describe("The character's occult casting proficiency modifier."),
				primalAttack: z
					.union([
						z.number().int().describe("The character's primal casting stat."),
						z.null().describe("The character's primal casting stat."),
					])
					.describe("The character's primal casting stat."),
				primalDC: z
					.union([
						z.number().int().describe("The character's primal casting stat."),
						z.null().describe("The character's primal casting stat."),
					])
					.describe("The character's primal casting stat."),
				primalProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's primal casting proficiency modifier."),
						z.null().describe("The character's primal casting proficiency modifier."),
					])
					.describe("The character's primal casting proficiency modifier."),
			})
			.describe("The character's casting stats."),
		saves: z
			.object({
				fortitude: z
					.union([
						z.number().int().describe("The character's fortitude save."),
						z.null().describe("The character's fortitude save."),
					])
					.describe("The character's fortitude save."),
				fortitudeProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's fortitude proficiency modifier."),
						z.null().describe("The character's fortitude proficiency modifier."),
					])
					.describe("The character's fortitude proficiency modifier."),
				reflex: z
					.union([
						z.number().int().describe("The character's reflex save."),
						z.null().describe("The character's reflex save."),
					])
					.describe("The character's reflex save."),
				reflexProfMod: z
					.union([
						z.number().int().describe("The character's reflex proficiency modifier."),
						z.null().describe("The character's reflex proficiency modifier."),
					])
					.describe("The character's reflex proficiency modifier."),
				will: z
					.union([
						z.number().int().describe("The character's will save."),
						z.null().describe("The character's will save."),
					])
					.describe("The character's will save."),
				willProfMod: z
					.union([
						z.number().int().describe("The character's will proficiency modifier."),
						z.null().describe("The character's will proficiency modifier."),
					])
					.describe("The character's will proficiency modifier."),
			})
			.describe("The character's saving throw attributes."),
		skills: z
			.object({
				acrobatics: z
					.union([
						z.number().int().describe("The character's acrobatics skill."),
						z.null().describe("The character's acrobatics skill."),
					])
					.describe("The character's acrobatics skill."),
				acrobaticsProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's acrobatics proficiency modifier."),
						z.null().describe("The character's acrobatics proficiency modifier."),
					])
					.describe("The character's acrobatics proficiency modifier."),
				arcana: z
					.union([
						z.number().int().describe("The character's arcana skill."),
						z.null().describe("The character's arcana skill."),
					])
					.describe("The character's arcana skill."),
				arcanaProfMod: z
					.union([
						z.number().int().describe("The character's arcana proficiency modifier."),
						z.null().describe("The character's arcana proficiency modifier."),
					])
					.describe("The character's arcana proficiency modifier."),
				athletics: z
					.union([
						z.number().int().describe("The character's athletics skill."),
						z.null().describe("The character's athletics skill."),
					])
					.describe("The character's athletics skill."),
				athleticsProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's athletics proficiency modifier."),
						z.null().describe("The character's athletics proficiency modifier."),
					])
					.describe("The character's athletics proficiency modifier."),
				crafting: z
					.union([
						z.number().int().describe("The character's crafting skill."),
						z.null().describe("The character's crafting skill."),
					])
					.describe("The character's crafting skill."),
				craftingProfMod: z
					.union([
						z.number().int().describe("The character's crafting proficiency modifier."),
						z.null().describe("The character's crafting proficiency modifier."),
					])
					.describe("The character's crafting proficiency modifier."),
				deception: z
					.union([
						z.number().int().describe("The character's deception skill."),
						z.null().describe("The character's deception skill."),
					])
					.describe("The character's deception skill."),
				deceptionProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's deception proficiency modifier."),
						z.null().describe("The character's deception proficiency modifier."),
					])
					.describe("The character's deception proficiency modifier."),
				diplomacy: z
					.union([
						z.number().int().describe("The character's diplomacy skill."),
						z.null().describe("The character's diplomacy skill."),
					])
					.describe("The character's diplomacy skill."),
				diplomacyProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's diplomacy proficiency modifier."),
						z.null().describe("The character's diplomacy proficiency modifier."),
					])
					.describe("The character's diplomacy proficiency modifier."),
				intimidation: z
					.union([
						z.number().int().describe("The character's intimidation skill."),
						z.null().describe("The character's intimidation skill."),
					])
					.describe("The character's intimidation skill."),
				intimidationProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's intimidation proficiency modifier."),
						z.null().describe("The character's intimidation proficiency modifier."),
					])
					.describe("The character's intimidation proficiency modifier."),
				medicine: z
					.union([
						z.number().int().describe("The character's medicine skill."),
						z.null().describe("The character's medicine skill."),
					])
					.describe("The character's medicine skill."),
				medicineProfMod: z
					.union([
						z.number().int().describe("The character's medicine proficiency modifier."),
						z.null().describe("The character's medicine proficiency modifier."),
					])
					.describe("The character's medicine proficiency modifier."),
				nature: z
					.union([
						z.number().int().describe("The character's nature skill."),
						z.null().describe("The character's nature skill."),
					])
					.describe("The character's nature skill."),
				natureProfMod: z
					.union([
						z.number().int().describe("The character's nature proficiency modifier."),
						z.null().describe("The character's nature proficiency modifier."),
					])
					.describe("The character's nature proficiency modifier."),
				occultism: z
					.union([
						z.number().int().describe("The character's occultism skill."),
						z.null().describe("The character's occultism skill."),
					])
					.describe("The character's occultism skill."),
				occultismProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's occultism proficiency modifier."),
						z.null().describe("The character's occultism proficiency modifier."),
					])
					.describe("The character's occultism proficiency modifier."),
				performance: z
					.union([
						z.number().int().describe("The character's performance skill."),
						z.null().describe("The character's performance skill."),
					])
					.describe("The character's performance skill."),
				performanceProfMod: z
					.union([
						z
							.number()
							.int()
							.describe("The character's performance proficiency modifier."),
						z.null().describe("The character's performance proficiency modifier."),
					])
					.describe("The character's performance proficiency modifier."),
				religion: z
					.union([
						z.number().int().describe("The character's religion skill."),
						z.null().describe("The character's religion skill."),
					])
					.describe("The character's religion skill."),
				religionProfMod: z
					.union([
						z.number().int().describe("The character's religion proficiency modifier."),
						z.null().describe("The character's religion proficiency modifier."),
					])
					.describe("The character's religion proficiency modifier."),
				society: z
					.union([
						z.number().int().describe("The character's society skill."),
						z.null().describe("The character's society skill."),
					])
					.describe("The character's society skill."),
				societyProfMod: z
					.union([
						z.number().int().describe("The character's society proficiency modifier."),
						z.null().describe("The character's society proficiency modifier."),
					])
					.describe("The character's society proficiency modifier."),
				stealth: z
					.union([
						z.number().int().describe("The character's stealth skill."),
						z.null().describe("The character's stealth skill."),
					])
					.describe("The character's stealth skill."),
				stealthProfMod: z
					.union([
						z.number().int().describe("The character's stealth proficiency modifier."),
						z.null().describe("The character's stealth proficiency modifier."),
					])
					.describe("The character's stealth proficiency modifier."),
				survival: z
					.union([
						z.number().int().describe("The character's survival skill."),
						z.null().describe("The character's survival skill."),
					])
					.describe("The character's survival skill."),
				survivalProfMod: z
					.union([
						z.number().int().describe("The character's survival proficiency modifier."),
						z.null().describe("The character's survival proficiency modifier."),
					])
					.describe("The character's survival proficiency modifier."),
				thievery: z
					.union([
						z.number().int().describe("The character's thievery skill."),
						z.null().describe("The character's thievery skill."),
					])
					.describe("The character's thievery skill."),
				thieveryProfMod: z
					.union([
						z.number().int().describe("The character's thievery proficiency modifier."),
						z.null().describe("The character's thievery proficiency modifier."),
					])
					.describe("The character's thievery proficiency modifier."),
				lores: z
					.array(
						z.strictObject({
							name: z.string().describe('The lore name.'),
							bonus: z
								.union([z.number().int(), z.null()])
								.describe('The lore bonus.'),
							profMod: z
								.union([
									z.number().int().describe('The lore proficiencyModifer.'),
									z.null().describe('The lore proficiencyModifer.'),
								])
								.describe('The lore proficiencyModifer.'),
						})
					)
					.describe("The character's lore skills."),
			})
			.describe("The character's skill attributes."),
		attacks: z
			.array(
				z.strictObject({
					name: z.string().describe('The attack name.'),
					toHit: z
						.union([
							z.number().int().describe('The attack toHit.'),
							z.null().describe('The attack toHit.'),
						])
						.describe('The attack toHit.'),
					damage: z
						.array(
							z
								.object({
									dice: z.string().describe('The attack damage dice.'),
									type: z
										.union([
											z.string().describe('The attack damage type.'),
											z.null().describe('The attack damage type.'),
										])
										.describe('The attack damage type.'),
								})
								.describe('A damage roll')
						)
						.describe('The attack damage.'),
					range: z
						.union([
							z.string().describe('The attack range.'),
							z.null().describe('The attack range.'),
						])
						.describe('The attack range.'),
					traits: z
						.union([
							z.array(z.string()).describe('The attack traits.'),
							z.null().describe('The attack traits.'),
						])
						.describe('The attack traits.'),
					notes: z
						.union([
							z.string().describe('The attack notes.'),
							z.null().describe('The attack notes.'),
						])
						.describe('The attack notes.'),
				})
			)
			.describe("The character's attacks."),
		sourceData: z
			.strictObject({})
			.describe('The source data the sheet was parsed from')
			.default({}),
		modifiers: z
			.array(zModifier)
			.describe(
				'An array of toggleable modifier objects that apply dice expression values to rolls with certain tags.'
			)
			.default([]),
		actions: z
			.array(zAction)
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

export const zCharacter = z
	.object({
		id: z.number().int().describe('The id of the character record.'),
		name: z.string().describe('The name of the character.'),
		charId: z.number().int().nullable().describe("The external wanderer's guide character id."),
		userId: z.string().describe('The discord id of the user who imported the character'),
		trackerMessageId: z
			.union([
				z
					.string()
					.describe("The discord id of message set to track this character's stats."),
				z.null().describe("The discord id of message set to track this character's stats."),
			])
			.describe("The discord id of message set to track this character's stats.")
			.nullable(),
		trackerChannelId: z
			.union([
				z
					.string()
					.describe(
						"The discord id of the channel containing the message set to track this character's stats."
					),
				z
					.null()
					.describe(
						"The discord id of the channel containing the message set to track this character's stats."
					),
			])
			.describe(
				"The discord id of the channel containing the message set to track this character's stats."
			)
			.nullable(),
		trackerGuildId: z
			.union([
				z
					.string()
					.describe(
						"The discord id of the guild with the channel set to track this character's stats."
					),
				z
					.null()
					.describe(
						"The discord id of the guild with the channel set to track this character's stats."
					),
			])
			.describe(
				"The discord id of the guild with the channel set to track this character's stats."
			)
			.nullable(),
		trackerMode: z
			.enum(['counters_only', 'basic_stats', 'full_sheet'])
			.describe(
				"The mode of the tracker message. Either counters_only', 'basic_stats', or 'full_sheet."
			),
		characterData: zCharacterData.nullable(),
		calculatedStats: zCalculatedStats.nullable(),
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
		actions: z.array(zAction),
		modifiers: z.array(zModifier),
		rollMacros: z.array(z.strictObject({ name: z.string(), macro: z.string() })),
		sheet: zSheet.default(SheetUtils.defaultSheet),
	})
	.describe('An imported character');
