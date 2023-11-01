import {
	AbilityEnum,
	Action,
	ActionCostEnum,
	ActionTypeEnum,
	AdvancedDamageRoll,
	AttackOrSkillRoll,
	DamageRoll,
	Modifier,
	ModifierTypeEnum,
	ProficiencyStat,
	Roll,
	RollModifier,
	RollTypeEnum,
	SaveRoll,
	Sheet,
	SheetAdjustment,
	SheetAdjustmentOperationEnum,
	SheetAdjustmentTypeEnum,
	SheetModifier,
	TextRoll,
	getDefaultSheet,
	isAbilityEnum,
	isActionCostEnum,
	isActionTypeEnum,
	isRollTypeEnum,
	isSheetAdjustmentOperationEnum,
	isSheetAdjustmentTypeEnum,
} from '../../services/kobold/index.js';
import { KoboldError } from '../KoboldError.js';
import {
	ActionV1,
	ModifierV1,
	RollV1,
	SheetAdjustmentV1,
	SheetV1,
	zSheetV1,
} from './character.v1.zod.js';
import { SheetAdjuster } from './sheet-adjuster.js';

const scoreToModifier = (score: number) => Math.floor((score - 10) / 2);

export function upgradeRoll(roll: RollV1): Roll {
	if (!isRollTypeEnum(roll.type)) {
		throw new KoboldError('Failed to parse roll! ' + JSON.stringify(roll));
	}
	if (roll.type === RollTypeEnum.attack || roll.type === RollTypeEnum.skillChallenge) {
		const result: AttackOrSkillRoll = {
			name: roll.name,
			type: roll.type,
			allowRollModifiers: roll.allowRollModifiers,
			targetDC: roll.targetDC ?? roll.saveTargetDC ?? null,
			roll: roll.roll ?? '',
		};
		return result;
	} else if (roll.type === RollTypeEnum.save) {
		const result: SaveRoll = {
			name: roll.name,
			type: roll.type,
			allowRollModifiers: roll.allowRollModifiers,
			saveRollType: roll.saveRollType ?? null,
			saveTargetDC: roll.saveTargetDC ?? null,
		};
		return result;
	} else if (roll.type === RollTypeEnum.text) {
		const result: TextRoll = {
			name: roll.name,
			type: roll.type,
			allowRollModifiers: roll.allowRollModifiers,
			defaultText: roll.defaultText ?? null,
			criticalSuccessText: roll.criticalSuccessText ?? null,
			criticalFailureText: roll.criticalFailureText ?? null,
			successText: roll.successText ?? null,
			failureText: roll.failureText ?? null,
			extraTags: roll.extraTags ?? [],
		};
		return result;
	} else if (roll.type === RollTypeEnum.advancedDamage) {
		const result: AdvancedDamageRoll = {
			name: roll.name,
			type: roll.type,
			allowRollModifiers: roll.allowRollModifiers,
			damageType: roll.damageType ?? null,
			healInsteadOfDamage: roll.healInsteadOfDamage ?? false,
			criticalSuccessRoll: roll.criticalSuccessRoll ?? null,
			criticalFailureRoll: roll.criticalFailureRoll ?? null,
			successRoll: roll.successRoll ?? null,
			failureRoll: roll.failureRoll ?? null,
		};
		return result;
	} else if (roll.type === RollTypeEnum.damage) {
		const result: DamageRoll = {
			name: roll.name,
			type: roll.type,
			allowRollModifiers: roll.allowRollModifiers,
			damageType: roll.damageType ?? null,
			healInsteadOfDamage: roll.healInsteadOfDamage ?? false,
			roll: roll.roll ?? '',
		};
		return result;
	} else {
		// impossible type
		throw new KoboldError('Failed to parse roll! Invalid roll type. ' + JSON.stringify(roll));
	}
}

export function upgradeAction(action: ActionV1): Action {
	const trimmedLowerActionType = action.type.trim().toLowerCase();
	let actionType = ActionTypeEnum.other;
	if (isActionTypeEnum(trimmedLowerActionType)) {
		actionType = trimmedLowerActionType;
	}
	const trimmedLowerActionCost = (action.actionCost ?? '').trim().toLowerCase();
	let actionCost: ActionCostEnum = ActionCostEnum.none;
	if (isActionCostEnum(trimmedLowerActionCost)) {
		actionCost = trimmedLowerActionCost;
	}
	const rolls: Roll[] = action.rolls.map(upgradeRoll);
	return {
		...action,
		type: actionType,
		actionCost,
		rolls,
	};
}
export function upgradeSheetAdjustment(
	sheetAdjustment: SheetAdjustmentV1,
	adjustmentType?: SheetAdjustmentTypeEnum
): SheetAdjustment {
	const property = SheetAdjuster.standardizeProperty(sheetAdjustment.property);
	const propertyType = SheetAdjuster.getPropertyType(property);
	const operation = isSheetAdjustmentOperationEnum(sheetAdjustment.operation)
		? sheetAdjustment.operation
		: SheetAdjustmentOperationEnum['='];
	const type = adjustmentType ?? SheetAdjustmentTypeEnum.untyped;
	return {
		property,
		value: sheetAdjustment.value,
		operation,
		propertyType,
		type,
	};
}

export function upgradeModifier(modifier: ModifierV1): Modifier {
	const trimmedLowerType = modifier.type.trim().toLowerCase();
	const adjustmentType = isSheetAdjustmentTypeEnum(trimmedLowerType)
		? trimmedLowerType
		: SheetAdjustmentTypeEnum.untyped;
	if (modifier.modifierType === ModifierTypeEnum.roll) {
		return {
			...modifier,
			modifierType: ModifierTypeEnum.roll,
			type: adjustmentType,
			value: modifier.value == null ? '' : modifier.value.toString(),
		} satisfies RollModifier;
	} else if (modifier.modifierType === ModifierTypeEnum.sheet) {
		return {
			...modifier,
			modifierType: ModifierTypeEnum.sheet,
			type: adjustmentType,
			sheetAdjustments: modifier.sheetAdjustments.map(adjustment =>
				upgradeSheetAdjustment(adjustment, adjustmentType)
			),
		} satisfies SheetModifier;
	} else {
		throw new KoboldError('Failed to parse modifier! Invalid modifier type.');
	}
}

export function upgradeSheet(sheet: SheetV1): Sheet {
	const defaultedSheet = zSheetV1.parse(sheet);
	const baseSheet = getDefaultSheet();
	const keyAbility: AbilityEnum | null = isAbilityEnum(sheet.info.keyability)
		? sheet.info.keyability
		: null;

	const level = defaultedSheet.info.level ?? 0;
	const abilities = {
		strength: sheet.abilities.strength ? scoreToModifier(sheet.abilities.strength) : 0,
		dexterity: sheet.abilities.dexterity ? scoreToModifier(sheet.abilities.dexterity) : 0,
		constitution: sheet.abilities.constitution
			? scoreToModifier(sheet.abilities.constitution)
			: 0,
		intelligence: sheet.abilities.intelligence
			? scoreToModifier(sheet.abilities.intelligence)
			: 0,
		wisdom: sheet.abilities.wisdom ? scoreToModifier(sheet.abilities.wisdom) : 0,
		charisma: sheet.abilities.charisma ? scoreToModifier(sheet.abilities.charisma) : 0,
	};

	function statFromSheetProps(
		stat: ProficiencyStat,
		bonus?: number | null,
		proficiency?: number | null
	): ProficiencyStat {
		if (bonus != null) {
			return {
				...stat,
				bonus,
				dc: bonus + 10,
				proficiency: proficiency ?? null,
			};
		} else {
			let parsedBonus = null;
			if (proficiency != null && stat.ability !== null) {
				parsedBonus = proficiency + level + abilities[stat.ability];
			}
			return {
				...stat,
				bonus: parsedBonus,
				dc: parsedBonus ? parsedBonus + 10 : null,
				proficiency: proficiency ?? null,
			};
		}
	}

	const newSheet: Sheet = {
		staticInfo: {
			name: sheet.info.name,
			level: level,
			usesStamina: sheet.info.usesStamina,
			keyAbility: keyAbility,
		},
		info: {
			url: sheet.info.url,
			description: sheet.info.description,
			gender: sheet.info.gender ?? null,
			age: sheet.info.age ? sheet.info.age.toString() : null,
			alignment: sheet.info.alignment ?? null,
			deity: sheet.info.deity ?? null,
			imageURL: sheet.info.imageURL ?? null,
			size: sheet.info.size ?? null,
			class: sheet.info.class ?? null,
			ancestry: sheet.info.ancestry ?? null,
			heritage: sheet.info.heritage,
			background: sheet.info.background ?? null,
		},
		infoLists: {
			traits: sheet.info.traits,
			senses: sheet.general.senses,
			languages: sheet.general.languages,
			immunities: sheet.defenses.immunities,
		},
		weaknessesResistances: {
			resistances: sheet.defenses.resistances,
			weaknesses: sheet.defenses.weaknesses,
		},
		intProperties: {
			ac: sheet.defenses.ac,

			...abilities,

			walkSpeed: sheet.general.speed,
			flySpeed: sheet.general.flySpeed,
			swimSpeed: sheet.general.swimSpeed,
			climbSpeed: sheet.general.climbSpeed,
			burrowSpeed: null,
			dimensionalSpeed: null,

			heavyProficiency: sheet.defenses.heavyProfMod ?? null,
			mediumProficiency: sheet.defenses.mediumProfMod ?? null,
			lightProficiency: sheet.defenses.lightProfMod ?? null,
			unarmoredProficiency: sheet.defenses.unarmoredProfMod ?? null,

			martialProficiency: sheet.offense.martialProfMod ?? null,
			simpleProficiency: sheet.offense.simpleProfMod ?? null,
			unarmedProficiency: sheet.offense.unarmedProfMod ?? null,
			advancedProficiency: sheet.offense.advancedProfMod ?? null,
		},
		baseCounters: {
			heroPoints: {
				name: 'Hero Points',
				style: 'default',
				current: sheet.general.currentHeroPoints ?? 0,
				max: 3,
				recoverable: false,
			},
			focusPoints: {
				name: 'Focus Points',
				style: 'default',
				current: sheet.general.currentFocusPoints ?? 0,
				max: sheet.general.focusPoints,
				recoverable: false,
			},
			hp: {
				name: 'HP',
				style: 'default',
				current: sheet.defenses.currentHp ?? 0,
				max: sheet.defenses.maxHp,
				recoverable: true,
			},
			tempHp: {
				name: 'Temp HP',
				style: 'default',
				current: sheet.defenses.tempHp ?? 0,
				max: null,
				recoverable: true,
			},
			resolve: {
				name: 'Resolve',
				style: 'default',
				current: sheet.defenses.currentResolve ?? 0,
				max: sheet.defenses.maxResolve ?? 0,
				recoverable: true,
			},
			stamina: {
				name: 'Stamina',
				style: 'default',
				current: sheet.defenses.currentStamina ?? 0,
				max: sheet.defenses.maxStamina ?? 0,
				recoverable: true,
			},
		},
		stats: {
			// Perception
			perception: statFromSheetProps(
				baseSheet.stats.perception,
				sheet.general.perception,
				sheet.general.perceptionProfMod
			),
			// Class DC/Attack
			class: statFromSheetProps(baseSheet.stats.class, sheet.general.classAttack),
			// Casting
			arcane: statFromSheetProps(
				baseSheet.stats.arcane,
				sheet.castingStats.arcaneAttack,
				sheet.castingStats.arcaneProfMod
			),
			divine: statFromSheetProps(
				baseSheet.stats.divine,
				sheet.castingStats.divineAttack,
				sheet.castingStats.divineProfMod
			),
			occult: statFromSheetProps(
				baseSheet.stats.occult,
				sheet.castingStats.occultAttack,
				sheet.castingStats.occultProfMod
			),
			primal: statFromSheetProps(
				baseSheet.stats.primal,
				sheet.castingStats.primalAttack,
				sheet.castingStats.primalProfMod
			),
			// Saves
			fortitude: statFromSheetProps(
				baseSheet.stats.fortitude,
				sheet.saves.fortitude,
				sheet.saves.fortitudeProfMod
			),
			reflex: statFromSheetProps(
				baseSheet.stats.reflex,
				sheet.saves.reflex,
				sheet.saves.reflexProfMod
			),
			will: statFromSheetProps(
				baseSheet.stats.will,
				sheet.saves.will,
				sheet.saves.willProfMod
			),
			// Skills
			acrobatics: statFromSheetProps(
				baseSheet.stats.acrobatics,
				sheet.skills.acrobatics,
				sheet.skills.acrobaticsProfMod
			),
			arcana: statFromSheetProps(
				baseSheet.stats.arcana,
				sheet.skills.arcana,
				sheet.skills.arcanaProfMod
			),
			athletics: statFromSheetProps(
				baseSheet.stats.athletics,
				sheet.skills.athletics,
				sheet.skills.athleticsProfMod
			),
			crafting: statFromSheetProps(
				baseSheet.stats.crafting,
				sheet.skills.crafting,
				sheet.skills.craftingProfMod
			),
			deception: statFromSheetProps(
				baseSheet.stats.deception,
				sheet.skills.deception,
				sheet.skills.deceptionProfMod
			),
			diplomacy: statFromSheetProps(
				baseSheet.stats.diplomacy,
				sheet.skills.diplomacy,
				sheet.skills.diplomacyProfMod
			),
			intimidation: statFromSheetProps(
				baseSheet.stats.intimidation,
				sheet.skills.intimidation,
				sheet.skills.intimidationProfMod
			),
			medicine: statFromSheetProps(
				baseSheet.stats.medicine,
				sheet.skills.medicine,
				sheet.skills.medicineProfMod
			),
			nature: statFromSheetProps(
				baseSheet.stats.nature,
				sheet.skills.nature,
				sheet.skills.natureProfMod
			),
			occultism: statFromSheetProps(
				baseSheet.stats.occultism,
				sheet.skills.occultism,
				sheet.skills.occultismProfMod
			),
			performance: statFromSheetProps(
				baseSheet.stats.performance,
				sheet.skills.performance,
				sheet.skills.performanceProfMod
			),
			religion: statFromSheetProps(
				baseSheet.stats.religion,
				sheet.skills.religion,
				sheet.skills.religionProfMod
			),
			society: statFromSheetProps(
				baseSheet.stats.society,
				sheet.skills.society,
				sheet.skills.societyProfMod
			),
			stealth: statFromSheetProps(
				baseSheet.stats.stealth,
				sheet.skills.stealth,
				sheet.skills.stealthProfMod
			),
			survival: statFromSheetProps(
				baseSheet.stats.survival,
				sheet.skills.survival,
				sheet.skills.survivalProfMod
			),
			thievery: statFromSheetProps(
				baseSheet.stats.thievery,
				sheet.skills.thievery,
				sheet.skills.thieveryProfMod
			),
		},
		additionalSkills: sheet.skills.lores.map(lore =>
			statFromSheetProps(
				{
					name: lore.name,
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.intelligence,
					note: null,
				},
				lore.bonus,
				lore.profMod
			)
		),
		attacks: sheet.attacks,
		rollMacros: sheet.rollMacros,
		actions: sheet.actions.map(upgradeAction),
		modifiers: sheet.modifiers.map(upgradeModifier),
		sourceData: sheet.sourceData,
	};
	return newSheet;
}
