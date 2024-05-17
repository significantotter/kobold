import { Sheet, ProficiencyStat, AbilityEnum } from '@kobold/db';
import _ from 'lodash';
import { WG } from '../../services/wanderers-guide/wanderers-guide.js';
import { SheetProperties, SheetStatProperties } from './sheet-properties.js';
import { applyValuesToStatInPlace, scoreToBonus } from './sheet-import-utils.js';

export function convertWanderersGuideCharToSheet(
	calculatedStats: WG.CharacterCalculatedStatsApiResponse,
	characterData: WG.CharacterApiResponse
): Sheet {
	if (typeof calculatedStats?.generalInfo === 'string') {
		calculatedStats.generalInfo = JSON.parse(calculatedStats.generalInfo);
	}
	if (typeof characterData?.infoJSON === 'string') {
		characterData.infoJSON = JSON.parse(characterData.infoJSON);
	}
	const [heritage, ancestry] = (calculatedStats.generalInfo?.heritageAncestryName ?? '').split(
		' '
	);

	const baseSheet = SheetProperties.defaultSheet;
	const level = characterData.level;
	baseSheet.staticInfo.level = level;

	for (const ability of calculatedStats.totalAbilityScores) {
		const abilityNameFirstThree = ability.Name.trim().toLowerCase().slice(0, 3);
		const abilityBonus = ability.Score ? scoreToBonus(ability.Score) : null;
		switch (abilityNameFirstThree) {
			case 'str':
				baseSheet.intProperties.strength = abilityBonus;
				break;
			case 'dex':
				baseSheet.intProperties.dexterity = abilityBonus;
				break;
			case 'con':
				baseSheet.intProperties.constitution = abilityBonus;
				break;
			case 'int':
				baseSheet.intProperties.intelligence = abilityBonus;
				break;
			case 'wis':
				baseSheet.intProperties.wisdom = abilityBonus;
				break;
			case 'cha':
				baseSheet.intProperties.charisma = abilityBonus;
				break;
		}
	}

	// casting stats
	if (calculatedStats.arcaneSpellProfMod !== null) {
		baseSheet.stats.arcane = {
			...baseSheet.stats.arcane,
			proficiency: calculatedStats.arcaneSpellProfMod ?? null,
			bonus: calculatedStats.arcaneSpellAttack ?? null,
			dc: calculatedStats.arcaneSpellDC ?? null,
		};
	}
	if (calculatedStats.divineSpellProfMod !== null) {
		baseSheet.stats.divine = {
			...baseSheet.stats.divine,
			proficiency: calculatedStats.divineSpellProfMod ?? null,
			bonus: calculatedStats.divineSpellAttack ?? null,
			dc: calculatedStats.divineSpellDC ?? null,
		};
	}
	if (calculatedStats.occultSpellProfMod !== null) {
		baseSheet.stats.occult = {
			...baseSheet.stats.occult,
			proficiency: calculatedStats.occultSpellProfMod ?? null,
			bonus: calculatedStats.occultSpellAttack ?? null,
			dc: calculatedStats.occultSpellDC ?? null,
		};
	}
	if (calculatedStats.primalSpellProfMod !== null) {
		baseSheet.stats.primal = {
			...baseSheet.stats.primal,
			proficiency: calculatedStats.primalSpellProfMod ?? null,
			bonus: calculatedStats.primalSpellAttack ?? null,
			dc: calculatedStats.primalSpellDC ?? null,
		};
	}

	// class stat
	const classDC = calculatedStats.totalClassDC ?? 10;
	const classBonus = classDC - 10;
	baseSheet.stats.class = {
		...baseSheet.stats.class,
		bonus: classBonus,
		dc: classDC,
		proficiency: calculatedStats.classDCProfMod ?? null,
		ability: null,
	};

	// perception stat
	const perceptionBonus = calculatedStats.totalPerception ?? 0;
	baseSheet.stats.perception = {
		...baseSheet.stats.perception,
		bonus: perceptionBonus,
		dc: perceptionBonus + 10,
		proficiency: calculatedStats.perceptionProfMod ?? null,
	};

	// save stats
	for (const save of calculatedStats.totalSaves) {
		const saveName = save.Name.trim().toLowerCase();
		if (saveName.startsWith('fort')) {
			baseSheet.stats.fortitude.bonus = _.isString(save.Bonus)
				? parseInt(save.Bonus)
				: save.Bonus;
			baseSheet.stats.fortitude.proficiency = save.ProficiencyMod ?? null;
			if (baseSheet.stats.fortitude.bonus)
				baseSheet.stats.fortitude.dc = baseSheet.stats.fortitude.bonus + 10;
		} else if (saveName.startsWith('ref')) {
			baseSheet.stats.reflex.bonus = _.isString(save.Bonus)
				? parseInt(save.Bonus)
				: save.Bonus;
			baseSheet.stats.reflex.proficiency = save.ProficiencyMod ?? null;
			if (baseSheet.stats.reflex.bonus)
				baseSheet.stats.reflex.dc = baseSheet.stats.reflex.bonus + 10;
		} else if (saveName.startsWith('will')) {
			baseSheet.stats.will.bonus = _.isString(save.Bonus) ? parseInt(save.Bonus) : save.Bonus;
			baseSheet.stats.will.proficiency = save.ProficiencyMod ?? null;
			if (baseSheet.stats.will.bonus)
				baseSheet.stats.will.dc = baseSheet.stats.will.bonus + 10;
		}
	}

	// skill stats
	for (const wgSkill of calculatedStats.totalSkills) {
		const standardizedSkillName = SheetProperties.standardizePropKey(wgSkill.Name);

		let stat: ProficiencyStat;

		if (standardizedSkillName in SheetStatProperties.aliases) {
			const skillNameAsStatKey = SheetStatProperties.aliases[standardizedSkillName];
			if (!skillNameAsStatKey) {
				// this is actually impossible, because
				// standardizedSkillName in SheetStatProperties.aliases
				// already ensures that we have a resulting key
				continue;
			}
			const skillPropName = SheetStatProperties.properties[skillNameAsStatKey].baseKey;
			baseSheet.stats[skillPropName] = {
				...baseSheet.stats[skillPropName],
			};
			stat = baseSheet.stats[skillPropName];
		} else {
			stat = {
				name: SheetProperties.standardizeCustomPropName(wgSkill.Name),
				proficiency: null,
				bonus: null,
				dc: null,
				note: null,
				ability: AbilityEnum.intelligence,
			};
			baseSheet.additionalSkills.push(stat);
		}
		let bonus = wgSkill.Bonus ?? null;
		if (_.isString(bonus)) bonus = parseInt(bonus);
		const proficiency = wgSkill.ProficiencyMod ?? null;
		applyValuesToStatInPlace(baseSheet, stat, bonus, proficiency, null);
	}

	const sheet: Sheet = {
		staticInfo: {
			name: characterData.name,
			level: level,
			usesStamina: characterData.variantStamina === 1,
			keyAbility: null,
		},
		info: {
			url: `https://legacy.wanderersguide.app/profile/characters/${characterData.id}`,
			description: null,
			gender: characterData?.infoJSON?.gender ?? null,
			age: characterData?.infoJSON?.age,
			alignment: characterData?.infoJSON?.alignment ?? null,
			deity: characterData?.infoJSON?.beliefs ?? null,
			imageURL: characterData?.infoJSON?.imageURL ?? null,
			size: calculatedStats.generalInfo?.size ?? null,
			class: calculatedStats.generalInfo?.className ?? null,
			ancestry,
			heritage,
			background: calculatedStats.generalInfo?.backgroundName ?? null,
		},
		infoLists: {
			...baseSheet.infoLists,
			traits: calculatedStats.generalInfo?.traits ?? [],
		},
		intProperties: {
			...baseSheet.intProperties,
			ac: calculatedStats.totalAC,
			walkSpeed: calculatedStats.totalSpeed,
			martialProficiency: calculatedStats.martialWeaponProfMod ?? null,
			simpleProficiency: calculatedStats.simpleWeaponProfMod ?? null,
			unarmedProficiency: calculatedStats.unarmedProfMod ?? null,
			advancedProficiency: calculatedStats.advancedWeaponProfMod ?? null,
		},
		baseCounters: {
			hp: {
				...baseSheet.baseCounters.hp,
				max: calculatedStats.maxHP ?? 0,
				current: calculatedStats.maxHP ?? 0,
			},
			tempHp: {
				...baseSheet.baseCounters.tempHp,
			},
			stamina: {
				...baseSheet.baseCounters.stamina,
				current: calculatedStats.maxStamina ?? 0,
				max: calculatedStats.maxStamina,
			},
			resolve: {
				...baseSheet.baseCounters.resolve,
				current: calculatedStats.maxResolve ?? 0,
				max: calculatedStats.maxResolve,
			},
			focusPoints: {
				...baseSheet.baseCounters.focusPoints,
			},
			heroPoints: {
				...baseSheet.baseCounters.heroPoints,
				max: 3,
				current: characterData.heroPoints ?? 0,
			},
		},
		weaknessesResistances: {
			resistances: [],
			weaknesses: [],
		},
		stats: baseSheet.stats,
		additionalSkills: baseSheet.additionalSkills,
		attacks: calculatedStats.weapons.map(weapon => {
			//remove the damage type from the damage string
			const damageComponents = (weapon.Damage ?? '').split(' ');
			const damageType = damageComponents.pop();
			return {
				name: weapon.Name,
				toHit: Number(String(weapon.Bonus)), //sometimes wg sends "+1" instead :/
				damage: [{ dice: damageComponents.join(' '), type: damageType ?? null }],
				effects: [],
				range: null,
				traits: [],
				notes: null,
			};
		}),

		sourceData: { calculatedStats, characterData },
	};
	return sheet;
}
