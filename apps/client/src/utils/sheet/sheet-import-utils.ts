import _ from 'lodash';
import { PartialDeep } from 'type-fest';
import {
	AbilityEnum,
	Damage,
	ProficiencyStat,
	Sheet,
	SheetAttack,
	SheetStatKeys,
	isAbilityEnum,
	isSheetIntegerKeys,
	isSheetStatKeys,
} from '../../services/kobold/index.js';
import { PathBuilder } from '../../services/pathbuilder/pathbuilder.js';
import { Creature, CreatureFluff, Stat } from '../../services/pf2etools/schemas/index-types.js';
import { WG } from '../../services/wanderers-guide/wanderers-guide.js';
import { SheetProperties, SheetStatProperties } from './sheet-properties.js';
import { SheetUtils } from './sheet-utils.js';

function parsePf2eStat(stat: Stat | number | null): { bonus: number | null; note: string } {
	if (stat == null) return { bonus: null, note: '' };
	if (_.isNumber(stat)) return { bonus: stat, note: '' };
	const bonus = parseInt((stat.std ?? stat.default ?? '').toString());
	const note = [stat.note ?? '', stat.notes ?? [], [stat.abilities].flat()]
		.flat()
		.filter(_.identity)
		.join('; ');
	return {
		bonus,
		note,
	};
}

const scoreToBonus = function (score: number) {
	return Math.floor((score - 10) / 2);
};

function parseDamageRoll(rollString: string): { type: string | null; dice: string | null }[] {
	const damageTypes: { type: string | null; dice: string | null }[] = [];
	rollString = rollString.replaceAll(/\[|\]|\([^\)]*\)/g, '');

	const damageClauses = rollString.split(/\W*(?:plus|and|,|,\W*and)\W*/g);

	for (const damageClause of damageClauses) {
		const match = damageClause.match(/(\d+\W*d?\W*\d*\W*\+?\W*\d*)?(?:\s*([a-zA-Z\s\.]+))?/);
		if (match) {
			const [, dice, type] = match;
			damageTypes.push({
				type: type ? type.trim() : null,
				dice: dice ? dice.trim() : null,
			});
		}
	}

	return damageTypes;
}

function applyValuesToStatInPlace(
	sheet: Sheet,
	stat: ProficiencyStat,
	bonus: number | string | null,
	dc: number | string | null,
	proficiency: number | string | null
) {
	let parsedBonus: number | null = _.isString(bonus) ? parseInt(bonus) : bonus;
	let parsedDc: number | null = _.isString(dc) ? parseInt(dc) : dc;
	let parsedProficiency: number | null = _.isString(proficiency)
		? parseInt(proficiency)
		: proficiency;
	if (parsedBonus !== null && isNaN(parsedBonus)) parsedBonus = null;
	if (parsedDc !== null && isNaN(parsedDc)) parsedDc = null;
	if (parsedProficiency !== null && isNaN(parsedProficiency)) parsedProficiency = null;

	// apply the stat values. We can use prof mods + abilities to
	// infer any missing bonus

	if (parsedBonus === null && parsedProficiency !== null && stat.ability !== null) {
		parsedBonus =
			parsedProficiency +
			(sheet.staticInfo.level ?? 0) +
			(sheet.intProperties[stat.ability] ?? 0);
	}
	parsedDc = parsedBonus !== null ? parsedBonus + 10 : null;

	stat.bonus = parsedBonus;
	stat.dc = parsedDc;
	stat.proficiency = parsedProficiency;
}

export function convertBestiaryCreatureToSheet(
	bestiaryEntry: Creature,
	fluffEntry: CreatureFluff | undefined,
	options: { useStamina?: boolean; template?: string; customName?: string }
): Sheet {
	const baseSheet = SheetProperties.defaultSheet;

	const challengeAdjustment =
		0 + (options?.template === 'elite' ? 1 : 0) - (options?.template === 'weak' ? 1 : 0);
	let hpAdjustment = 0;

	if (challengeAdjustment > 0) {
		if (!bestiaryEntry.level || bestiaryEntry.level <= 1) {
			hpAdjustment = 10;
		} else if (bestiaryEntry.level <= 4) {
			hpAdjustment = 15;
		} else if (bestiaryEntry.level <= 19) {
			hpAdjustment = 20;
		} else {
			hpAdjustment = 30;
		}
	} else if (challengeAdjustment < 0) {
		if (!bestiaryEntry.level || bestiaryEntry.level <= 2) {
			hpAdjustment = -10;
		} else if (bestiaryEntry.level <= 5) {
			hpAdjustment = -15;
		} else if (bestiaryEntry.level <= 20) {
			hpAdjustment = -20;
		} else {
			hpAdjustment = -30;
		}
	}
	hpAdjustment *= Math.abs(challengeAdjustment) ?? 0;

	const rollAdjustment = 2 * challengeAdjustment ?? 0;

	const size = (bestiaryEntry.traits || ['medium']).filter(trait => {
		return ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', 'colossal'].includes(
			trait
		);
	});
	let focusPoints: number | null = 0;
	for (const castingType of bestiaryEntry?.spellcasting || []) {
		if (castingType.fp) {
			focusPoints += castingType.fp;
		}
		if (focusPoints > 3) focusPoints = 3;
	}
	if (focusPoints === 0) focusPoints = null;

	for (const spellcasting of bestiaryEntry?.spellcasting || []) {
		if (spellcasting.tradition === 'occult') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				baseSheet.stats.occult.bonus =
					Math.max(baseSheet.stats.occult.bonus ?? 0, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				baseSheet.stats.occult.dc =
					Math.max(baseSheet.stats.occult.dc ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
		if (spellcasting.tradition === 'divine') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				baseSheet.stats.divine.bonus =
					Math.max(baseSheet.stats.divine.bonus ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				baseSheet.stats.divine.dc =
					Math.max(baseSheet.stats.divine.dc ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
		if (spellcasting.tradition === 'arcane') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				baseSheet.stats.arcane.bonus =
					Math.max(baseSheet.stats.arcane.bonus ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				baseSheet.stats.arcane.dc =
					Math.max(baseSheet.stats.arcane.dc ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
		if (spellcasting.tradition === 'primal') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				baseSheet.stats.primal.bonus =
					Math.max(baseSheet.stats.primal.bonus ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				baseSheet.stats.primal.dc =
					Math.max(baseSheet.stats.primal.dc ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
	}

	for (const skillName in bestiaryEntry.skills) {
		const skill = bestiaryEntry.skills[skillName];
		let { bonus, note } = parsePf2eStat(skill);
		if (bonus && rollAdjustment) {
			bonus += rollAdjustment;
		}
		let dc = bonus !== null ? 10 + bonus : null;

		if (isSheetStatKeys(skillName)) {
			baseSheet.stats[skillName] = {
				...baseSheet.stats[skillName],
				bonus,
				dc,
				note,
			};
		} else {
			baseSheet.additionalSkills.push({
				name: skillName,
				proficiency: null,
				bonus,
				dc,
				note,
				ability: AbilityEnum.intelligence,
			});
		}
	}
	const { bonus: perceptionBonus, note: perceptionNote } = parsePf2eStat(
		bestiaryEntry.perception ?? null
	);
	baseSheet.stats.perception = {
		...baseSheet.stats.perception,
		bonus: perceptionBonus ? perceptionBonus + rollAdjustment : null,
		dc: perceptionBonus ? perceptionBonus + rollAdjustment + 10 : null,
		note: perceptionNote,
	};

	let { bonus: fortBonus, note: fortNote } = parsePf2eStat(
		bestiaryEntry.defenses?.savingThrows?.fort ?? null
	);
	let { bonus: refBonus, note: refNote } = parsePf2eStat(
		bestiaryEntry.defenses?.savingThrows?.ref ?? null
	);
	let { bonus: willBonus, note: willNote } = parsePf2eStat(
		bestiaryEntry.defenses?.savingThrows?.will ?? null
	);
	if (rollAdjustment) {
		if (fortBonus) fortBonus += rollAdjustment;
		if (refBonus) refBonus += rollAdjustment;
		if (willBonus) willBonus += rollAdjustment;
	}
	baseSheet.stats.fortitude = {
		...baseSheet.stats.fortitude,
		bonus: fortBonus,
		dc: fortBonus ? fortBonus + 10 : null,
	};
	baseSheet.stats.reflex = {
		...baseSheet.stats.reflex,
		bonus: refBonus,
		dc: refBonus ? refBonus + 10 : null,
	};
	baseSheet.stats.will = {
		...baseSheet.stats.will,
		bonus: willBonus,
		dc: willBonus ? willBonus + 10 : null,
	};

	let attacks: SheetAttack[] = [];

	for (const attack of bestiaryEntry?.attacks || []) {
		let damageResult: { type: null | string; dice: null | string }[] = [];

		if (attack.damageType && _.isString(attack.damage)) {
			damageResult.push({
				dice: attack.damage,
				type: attack.damageType,
			});
			if (attack.damageType2 && attack.damage2) {
				damageResult.push({
					dice: attack.damage2,
					type: attack.damageType2,
				});
			}
		} else {
			for (const damage of [attack.damage].flat()) {
				if (damage) damageResult = parseDamageRoll(damage);
			}
		}

		for (const effect of attack.effects || []) {
			if (effect.toString()) {
				damageResult.push({ dice: null, type: effect.toString() });
			}
		}

		const damageRolls: Damage[] = damageResult.filter(
			(result): result is Damage => result.dice != null
		);
		const effects: string[] = _.uniq(
			damageResult
				.filter(
					(result): result is { dice: null; type: string } =>
						result.dice == null && result.type != null
				)
				.map(result => result.type)
		);

		let damageChallengeAdjustment = challengeAdjustment * 2;
		let damageChallengeText =
			damageChallengeAdjustment !== 0 && damageChallengeAdjustment != null
				? `+${damageChallengeAdjustment}`
				: '';
		if (damageRolls.length > 0 && damageRolls[0].dice) {
			damageRolls[0].dice += damageChallengeText;
		}

		attacks.push({
			name: attack.name,
			range: attack.range ? attack.range.toString() : null,
			toHit: attack.attack ? attack.attack + rollAdjustment : null,
			damage: damageRolls,
			effects,
			traits: attack.traits ?? [],
			notes: null,
		});
	}

	let hpValue: null | number = 0;
	const bestiaryHp = bestiaryEntry.defenses?.hp;
	if (_.isArray(bestiaryHp)) {
		for (const hp of bestiaryHp) {
			hpValue += hp.hp;
		}
	} else if (_.isUndefined(bestiaryHp)) {
		hpValue = null;
	} else if (_.isNumber(bestiaryHp)) {
		hpValue = bestiaryHp;
	} else if (_.isString(bestiaryHp)) {
		hpValue = parseInt(bestiaryHp);
		if (isNaN(hpValue)) hpValue = null;
	} else {
		for (const value of Object.values(bestiaryHp)) {
			if (_.isNumber(value)) {
				hpValue += value;
			} else if (_.isString(value)) {
				const parsed = parseInt(value);
				if (!isNaN(parsed)) {
					hpValue += parsed;
				}
			} else {
				for (const subValue of Object.values(value)) {
					if (_.isNumber(subValue)) {
						hpValue += subValue;
					} else {
						const parsed = parseInt(subValue);
						if (!isNaN(parsed)) {
							hpValue += parsed;
						}
					}
				}
			}
		}
	}
	if (hpValue !== null) hpValue += hpAdjustment;

	let ac = parsePf2eStat(bestiaryEntry.defenses?.ac ?? null).bonus;
	if (ac !== null) ac += rollAdjustment;

	const sheet: Sheet = {
		staticInfo: {
			name:
				options?.customName ??
				(options?.template ? `${_.capitalize(options.template)} ` : '') +
					bestiaryEntry.name,
			usesStamina: options.useStamina ?? false,
			level: (bestiaryEntry.level ?? 0) + challengeAdjustment,
			keyAbility: null,
		},
		info: {
			description: bestiaryEntry.description ?? null,
			url: `https://pf2etools.com/bestiary.html#${bestiaryEntry.name.replaceAll(
				' ',
				'%20'
			)}_${bestiaryEntry.source}`,
			gender: null,
			age: null,
			alignment: null,
			deity: null,
			imageURL: fluffEntry?.images?.[0] ?? null,
			size: size?.[0] ?? 'medium',
			class: null,
			ancestry: null,
			heritage: null,
			background: null,
		},
		infoLists: {
			traits: bestiaryEntry.traits || [],
			senses: (bestiaryEntry.senses || [])
				.map(sense => sense?.name)
				.filter(name => name && name?.length),
			languages: bestiaryEntry.languages?.languages || [],
			immunities: bestiaryEntry.defenses?.immunities ?? [],
		},
		intProperties: {
			ac: ac,
			strength: bestiaryEntry.abilityMods?.str ?? null,
			dexterity: bestiaryEntry.abilityMods?.dex ?? null,
			constitution: bestiaryEntry.abilityMods?.con ?? null,
			intelligence: bestiaryEntry.abilityMods?.int ?? null,
			wisdom: bestiaryEntry.abilityMods?.wis ? bestiaryEntry.abilityMods.wis : null,
			charisma: bestiaryEntry.abilityMods?.cha ?? null,

			walkSpeed: bestiaryEntry.speed?.walk ?? null,
			flySpeed: bestiaryEntry.speed?.fly ?? null,
			swimSpeed: bestiaryEntry.speed?.swim ?? null,
			climbSpeed: bestiaryEntry.speed?.climb ?? null,
			burrowSpeed: bestiaryEntry.speed?.burrow ?? null,
			dimensionalSpeed: bestiaryEntry.speed?.dimensional ?? null,

			unarmoredProficiency: null,
			lightProficiency: null,
			mediumProficiency: null,
			heavyProficiency: null,

			unarmedProficiency: null,
			simpleProficiency: null,
			martialProficiency: null,
			advancedProficiency: null,
		},
		baseCounters: {
			hp: {
				...baseSheet.baseCounters.hp,
				current: hpValue ?? 0,
				max: hpValue,
			},
			tempHp: {
				...baseSheet.baseCounters.tempHp,
				current: 0,
				max: 0,
			},
			stamina: {
				...baseSheet.baseCounters.stamina,
				current: 0,
				max: 0,
			},
			resolve: {
				...baseSheet.baseCounters.resolve,
				current: 0,
				max: 0,
			},
			heroPoints: {
				...baseSheet.baseCounters.heroPoints,
				current: 0,
				max: 0,
			},
			focusPoints: {
				...baseSheet.baseCounters.focusPoints,
				current: focusPoints ?? 0,
				max: focusPoints,
			},
		},
		weaknessesResistances: {
			resistances: (bestiaryEntry.defenses?.resistances || []).map(res =>
				_.isString(res)
					? {
							type: res,
							amount: 0,
					  }
					: {
							type: res.name,
							amount: res.amount ?? 0,
					  }
			),
			weaknesses: (bestiaryEntry.defenses?.weaknesses || []).map(weak =>
				_.isString(weak)
					? {
							type: weak,
							amount: 0,
					  }
					: {
							type: weak.name,
							amount: weak.amount ?? 0,
					  }
			),
		},
		stats: baseSheet.stats,
		additionalSkills: baseSheet.additionalSkills,
		attacks,
		sourceData: { data: bestiaryEntry, fluff: fluffEntry },
	};

	return sheet;
}
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
			url: `https://wanderersguide.app/profile/characters/${characterData.id}`,
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

export function applyStatOverrides(sheet: Sheet, statString: string): Sheet {
	// treat the stat override string as just a bunch of sheet modifier adjustments
	const adjustments = SheetUtils.stringToSheetAdjustments(statString);
	const adjustedSheet = SheetUtils.adjustSheetWithSheetAdjustments(sheet, adjustments);
	return adjustedSheet;
}

export function convertPathBuilderToSheet(
	pathBuilderSheet: PathBuilder.Character,
	options: {
		useStamina: boolean;
	}
): Sheet {
	let maxStamina = null;
	let maxResolve = null;
	let hp = null;

	let sizeToString = (size: number): string => {
		switch (size) {
			case -1:
				return 'diminutive';
			case 0:
				return 'tiny';
			case 1:
				return 'small';
			case 2:
				return 'medium';
			case 3:
				return 'large';
			case 4:
				return 'huge';
			case 5:
				return 'gargantuan';
			case 6:
				return 'colossal';
			default:
				return 'medium';
		}
	};
	const pathBuilderProfToScore = function (prof?: number) {
		if (!prof || prof < 0) return 0;
		return prof + pathBuilderSheet.level;
	};

	const trimmedKeyAbility = pathBuilderSheet.keyability.trim().toLowerCase();
	const standardizedAbility = SheetProperties.abilityFromAlias[trimmedKeyAbility];
	const keyAbility = isAbilityEnum(standardizedAbility) ? standardizedAbility : null;

	// these are modifying values from different sources for certain stats
	// for example, item bonuses to skills
	const modKeys = _.mapKeys(pathBuilderSheet.mods, (value, key) => key.toLocaleLowerCase());
	const modsFixed = _.mapValues(modKeys, (value, key) =>
		_.values(value).reduce((acc, val) => {
			if (isNaN(val)) return acc;
			return acc + (val ?? 0);
		}, 0)
	);
	const mods = function (key: string) {
		return modsFixed[key.toLocaleLowerCase()] ?? 0;
	};

	const baseSheet = SheetProperties.defaultSheet;
	baseSheet.staticInfo.level = pathBuilderSheet.level;
	baseSheet.stats.class.ability = keyAbility;

	baseSheet.intProperties.strength =
		scoreToBonus(pathBuilderSheet.abilities.str) + mods('strength');
	baseSheet.intProperties.dexterity =
		scoreToBonus(pathBuilderSheet.abilities.dex) + mods('dexterity');
	baseSheet.intProperties.constitution =
		scoreToBonus(pathBuilderSheet.abilities.con) + mods('constitution');
	baseSheet.intProperties.intelligence =
		scoreToBonus(pathBuilderSheet.abilities.int) + mods('intelligence');
	baseSheet.intProperties.wisdom = scoreToBonus(pathBuilderSheet.abilities.wis) + mods('wisdom');
	baseSheet.intProperties.charisma =
		scoreToBonus(pathBuilderSheet.abilities.cha) + mods('charisma');

	if (options.useStamina) {
		hp =
			pathBuilderSheet.attributes.ancestryhp +
			pathBuilderSheet.attributes.bonushp +
			(pathBuilderSheet.attributes.classhp / 2 +
				pathBuilderSheet.attributes.bonushpPerLevel) *
				pathBuilderSheet.level;
		maxStamina =
			(pathBuilderSheet.attributes.classhp / 2 + baseSheet.intProperties.constitution) *
			pathBuilderSheet.level;
		maxResolve = baseSheet.intProperties[pathBuilderSheet.keyability as AbilityEnum];
	} else {
		hp =
			pathBuilderSheet.attributes.ancestryhp +
			pathBuilderSheet.attributes.bonushp +
			(pathBuilderSheet.attributes.classhp +
				pathBuilderSheet.attributes.bonushpPerLevel +
				baseSheet.intProperties.constitution) *
				pathBuilderSheet.level;
	}

	let keyAbilityBonus = keyAbility ? baseSheet.intProperties[keyAbility] ?? 0 : 0;

	// spellcasting stats
	for (const spellcasting of pathBuilderSheet.spellCasters) {
		const spellAbility =
			SheetProperties.abilityFromAlias[spellcasting.ability.trim().toLowerCase()] ??
			AbilityEnum.intelligence;
		baseSheet.stats[spellcasting.magicTradition].ability = spellAbility;

		applyValuesToStatInPlace(
			baseSheet,
			baseSheet.stats[spellcasting.magicTradition],
			null,
			null,
			spellcasting.proficiency
		);
	}
	for (const focusCastingTradition in pathBuilderSheet.focus) {
		if (focusCastingTradition in baseSheet.stats) {
			const traditionKey = focusCastingTradition as SheetStatKeys;
			if (baseSheet.stats[traditionKey].bonus === null) {
				// if this falls under a new tradition not covered by normal spellcasting
				// use the highest focus spell combo of ability and proficiency for this tradition
				const focusCasting =
					pathBuilderSheet.focus[focusCastingTradition as keyof PathBuilder.Focus];
				const allSpellcastingAbilities: {
					attack: number;
					proficiency: number;
					ability: AbilityEnum | null;
				}[] = Object.values(
					_.mapValues(focusCasting, (value, key) => ({
						attack:
							pathBuilderProfToScore(value?.proficiency ?? 0) +
							(value?.abilityBonus ?? 0) +
							(value?.itemBonus ?? 0),
						proficiency: value?.proficiency ?? 0,
						ability: SheetProperties.abilityFromAlias[key.trim().toLowerCase()] ?? null,
					}))
				);

				const highestSpellcastingAbility = _.maxBy<{
					attack: number;
					proficiency: number;
					ability: AbilityEnum | null;
				}>(allSpellcastingAbilities, 'attack');
				if (highestSpellcastingAbility) {
					baseSheet.stats[traditionKey] = {
						...baseSheet.stats[traditionKey],
						bonus: highestSpellcastingAbility.attack,
						proficiency: highestSpellcastingAbility.proficiency,
						ability: highestSpellcastingAbility.ability,
					};
				}
			}
		}
	}
	// class stat
	applyValuesToStatInPlace(
		baseSheet,
		baseSheet.stats.class,
		null,
		null,
		pathBuilderSheet.proficiencies.classDC ?? null
	);

	let statKey: keyof PathBuilder.Proficiencies;
	for (statKey in pathBuilderSheet.proficiencies) {
		const statProfMod = pathBuilderSheet.proficiencies[statKey] ?? 0;
		let stat: ProficiencyStat | undefined = undefined;

		const statKeyAlias =
			SheetProperties.aliases[SheetProperties.standardizePropKey(statKey.toLowerCase())];

		if (statKeyAlias && SheetProperties.properties[statKeyAlias]) {
			const property = SheetProperties.properties[statKeyAlias];
			if ('baseKey' in property) {
				let sheetStatKey = property.baseKey;
				stat = baseSheet.stats[sheetStatKey];
			} else {
				if (isSheetIntegerKeys(statKeyAlias)) {
					baseSheet.intProperties[statKeyAlias] = statProfMod;
				}
			}
		} else {
			stat = {
				name: statKey,
				proficiency: null,
				bonus: null,
				dc: null,
				note: null,
				ability: AbilityEnum.intelligence,
			};
			baseSheet.additionalSkills.push(stat);
		}
		if (!stat) continue;
		const statBonus =
			pathBuilderProfToScore(pathBuilderSheet.proficiencies[statKey]) +
			(baseSheet.intProperties[stat.ability ?? AbilityEnum.intelligence] ?? 0) +
			mods(statKey);

		applyValuesToStatInPlace(baseSheet, stat, statBonus, null, statProfMod);
	}

	for (const [loreName, loreProfMod] of pathBuilderSheet.lores ?? []) {
		const loreStat: ProficiencyStat = {
			name: loreName + ' Lore' ?? 'Unknown Lore',
			proficiency: loreProfMod ?? 0,
			bonus: null,
			dc: null,
			note: null,
			ability:
				// special case for esoteric lore for Thaumaturge
				(loreName ?? '').toLowerCase() === 'esoteric'
					? AbilityEnum.charisma
					: AbilityEnum.intelligence,
		};
		baseSheet.additionalSkills.push(loreStat);
		applyValuesToStatInPlace(baseSheet, loreStat, null, null, loreProfMod ?? 0);
	}

	const sheet: Sheet = {
		staticInfo: {
			name: pathBuilderSheet.name,
			level: pathBuilderSheet.level,
			usesStamina: options.useStamina ?? false,
			keyAbility: keyAbility,
		},
		info: {
			...baseSheet.info,
			gender: pathBuilderSheet.gender ?? null,
			age: pathBuilderSheet.age ? pathBuilderSheet.age.toString() : null,
			alignment: pathBuilderSheet.alignment ?? null,
			deity: pathBuilderSheet.deity ?? null,
			size: sizeToString(pathBuilderSheet.size),
			class: pathBuilderSheet.class,
			ancestry: pathBuilderSheet.ancestry,
			heritage: pathBuilderSheet.heritage.replace(' ' + pathBuilderSheet.ancestry, ''),
			background: pathBuilderSheet.background,
		},
		infoLists: {
			...baseSheet.infoLists,
			languages: pathBuilderSheet.languages || [],
		},
		intProperties: {
			...baseSheet.intProperties,
			ac: pathBuilderSheet.acTotal.acTotal,
			walkSpeed: pathBuilderSheet.attributes.speed + pathBuilderSheet.attributes.speedBonus,

			martialProficiency: pathBuilderSheet.proficiencies.martial ?? 0,
			simpleProficiency: pathBuilderSheet.proficiencies.simple ?? 0,
			unarmedProficiency: pathBuilderSheet.proficiencies.unarmed ?? 0,
			advancedProficiency: pathBuilderSheet.proficiencies.advanced ?? 0,

			heavyProficiency: pathBuilderSheet.proficiencies.heavy ?? 0,
			mediumProficiency: pathBuilderSheet.proficiencies.medium ?? 0,
			lightProficiency: pathBuilderSheet.proficiencies.light ?? 0,
			unarmoredProficiency: pathBuilderSheet.proficiencies.unarmored ?? 0,
		},
		baseCounters: {
			hp: {
				...baseSheet.baseCounters.hp,
				current: hp,
				max: hp,
			},
			tempHp: baseSheet.baseCounters.tempHp,
			resolve: {
				...baseSheet.baseCounters.resolve,
				current: maxResolve ?? 0,
				max: maxResolve,
			},
			stamina: {
				...baseSheet.baseCounters.stamina,
				current: maxStamina ?? 0,
				max: maxStamina,
			},
			focusPoints: {
				...baseSheet.baseCounters.focusPoints,
				current: pathBuilderSheet.focusPoints ?? 0,
				max: pathBuilderSheet.focusPoints,
			},
			heroPoints: { ...baseSheet.baseCounters.heroPoints, max: 3 },
		},
		weaknessesResistances: {
			resistances: [],
			weaknesses: [],
		},
		stats: baseSheet.stats,
		additionalSkills: baseSheet.additionalSkills,
		attacks: pathBuilderSheet.weapons.map(weapon => {
			let numDice = 1;
			if (String(weapon.str).toLocaleLowerCase() == 'striking') {
				numDice = 2;
			} else if (String(weapon.str).toLocaleLowerCase() == 'greaterstriking') {
				numDice = 3;
			} else if (String(weapon.str).toLocaleLowerCase() == 'majorstriking') {
				numDice = 4;
			}

			const mainDamage = {
				dice:
					numDice +
					(weapon.die ?? '') +
					(weapon.damageBonus ? ' + ' + weapon.damageBonus : ''),
				type: weapon.damageType,
				// base type isn't provided by pathbuilder
			};
			const extraDamage = (weapon.extraDamage ?? []).map(damage => {
				const [dice, ...type] = damage.split(' ');
				return {
					dice,
					type: type.join(' '),
				};
			});
			return {
				name: String(weapon.name),
				toHit: weapon.attack,
				damage: [mainDamage, ...extraDamage],
				effects: [],
				range: null,
				traits: [],
				notes: null,
			} satisfies SheetAttack;
		}),
		sourceData: pathBuilderSheet,
	};

	return sheet;
}
