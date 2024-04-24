import {
	Sheet,
	isAbilityEnum,
	AbilityEnum,
	SheetStatKeys,
	ProficiencyStat,
	isSheetIntegerKeys,
	SheetAttack,
} from 'kobold-db';
import _ from 'lodash';
import { PathBuilder } from '../../services/pathbuilder/pathbuilder.js';
import { scoreToBonus, applyValuesToStatInPlace } from './sheet-import-utils.js';
import { SheetProperties } from './sheet-properties.js';

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
		maxResolve = baseSheet.intProperties[keyAbility!] ?? 0;
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
		const currentStat = _.cloneDeep(baseSheet.stats[spellcasting.magicTradition]);
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
		if (
			currentStat.bonus != null &&
			currentStat.bonus > baseSheet.stats[spellcasting.magicTradition].bonus!
		) {
			baseSheet.stats[spellcasting.magicTradition] = currentStat;
		}
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
