import _ from 'lodash';
import {
	AbilityEnum,
	getDefaultSheet,
	isAbilityEnum,
	Sheet,
	SheetAttack,
	SheetIntegerKeys,
	SheetStatKeys,
	PathBuilder,
	type ProficiencyStat,
} from '@kobold/schema';
import { applyValuesToStatInPlace, scoreToBonus } from './sheet-import-utils.js';
import { createNethysItemMetadataIndex } from './nethys-item-metadata.js';

type PathbuilderPropertyTarget =
	| { kind: 'stat'; key: SheetStatKeys }
	| { kind: 'integer'; key: SheetIntegerKeys };

const ABILITY_FROM_ALIAS: Record<string, AbilityEnum> = {
	str: AbilityEnum.strength,
	dex: AbilityEnum.dexterity,
	con: AbilityEnum.constitution,
	int: AbilityEnum.intelligence,
	wis: AbilityEnum.wisdom,
	cha: AbilityEnum.charisma,
	[AbilityEnum.strength]: AbilityEnum.strength,
	[AbilityEnum.dexterity]: AbilityEnum.dexterity,
	[AbilityEnum.constitution]: AbilityEnum.constitution,
	[AbilityEnum.intelligence]: AbilityEnum.intelligence,
	[AbilityEnum.wisdom]: AbilityEnum.wisdom,
	[AbilityEnum.charisma]: AbilityEnum.charisma,
};

const PATHBUILDER_PROFICIENCY_MAP: Record<string, PathbuilderPropertyTarget> = {
	perception: { kind: 'stat', key: SheetStatKeys.perception },
	fortitude: { kind: 'stat', key: SheetStatKeys.fortitude },
	reflex: { kind: 'stat', key: SheetStatKeys.reflex },
	will: { kind: 'stat', key: SheetStatKeys.will },
	castingarcane: { kind: 'stat', key: SheetStatKeys.arcane },
	castingdivine: { kind: 'stat', key: SheetStatKeys.divine },
	castingoccult: { kind: 'stat', key: SheetStatKeys.occult },
	castingprimal: { kind: 'stat', key: SheetStatKeys.primal },
	acrobatics: { kind: 'stat', key: SheetStatKeys.acrobatics },
	arcana: { kind: 'stat', key: SheetStatKeys.arcana },
	athletics: { kind: 'stat', key: SheetStatKeys.athletics },
	crafting: { kind: 'stat', key: SheetStatKeys.crafting },
	deception: { kind: 'stat', key: SheetStatKeys.deception },
	diplomacy: { kind: 'stat', key: SheetStatKeys.diplomacy },
	intimidation: { kind: 'stat', key: SheetStatKeys.intimidation },
	medicine: { kind: 'stat', key: SheetStatKeys.medicine },
	nature: { kind: 'stat', key: SheetStatKeys.nature },
	occultism: { kind: 'stat', key: SheetStatKeys.occultism },
	performance: { kind: 'stat', key: SheetStatKeys.performance },
	religion: { kind: 'stat', key: SheetStatKeys.religion },
	society: { kind: 'stat', key: SheetStatKeys.society },
	stealth: { kind: 'stat', key: SheetStatKeys.stealth },
	survival: { kind: 'stat', key: SheetStatKeys.survival },
	thievery: { kind: 'stat', key: SheetStatKeys.thievery },
	heavy: { kind: 'integer', key: SheetIntegerKeys.heavyProficiency },
	medium: { kind: 'integer', key: SheetIntegerKeys.mediumProficiency },
	light: { kind: 'integer', key: SheetIntegerKeys.lightProficiency },
	unarmored: { kind: 'integer', key: SheetIntegerKeys.unarmoredProficiency },
	martial: { kind: 'integer', key: SheetIntegerKeys.martialProficiency },
	simple: { kind: 'integer', key: SheetIntegerKeys.simpleProficiency },
	unarmed: { kind: 'integer', key: SheetIntegerKeys.unarmedProficiency },
	advanced: { kind: 'integer', key: SheetIntegerKeys.advancedProficiency },
};

function standardizePropKey(name: string): string {
	return name.toLowerCase().trim().replaceAll(/_|-/g, '');
}

function getPathbuilderAbility(alias: string): AbilityEnum | null {
	const standardized = standardizePropKey(alias);
	const ability = ABILITY_FROM_ALIAS[standardized];
	return isAbilityEnum(ability) ? ability : null;
}

function sizeToString(size: number): string {
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
}

function getHighestProficiency(
	baseProficiency: number | undefined,
	category: string,
	specificProficiencies: PathBuilder.SpecificProficiencies
): number {
	const categoryLower = category.toLowerCase();
	let highestMod = baseProficiency ?? 0;

	const containsCategory = (items: any[]): boolean => {
		if (!items) return false;
		return items.some(item => {
			if (typeof item === 'string') {
				return item.toLowerCase() === categoryLower;
			}
			if (typeof item === 'object' && item !== null) {
				const name = item.name || item.Name || item.category || item.Category;
				return typeof name === 'string' && name.toLowerCase() === categoryLower;
			}
			return false;
		});
	};

	if (containsCategory(specificProficiencies.legendary)) {
		highestMod = Math.max(highestMod, 8);
	} else if (containsCategory(specificProficiencies.master)) {
		highestMod = Math.max(highestMod, 6);
	} else if (containsCategory(specificProficiencies.expert)) {
		highestMod = Math.max(highestMod, 4);
	} else if (containsCategory(specificProficiencies.trained)) {
		highestMod = Math.max(highestMod, 2);
	}

	return highestMod;
}

export function convertPathBuilderToSheet(
	pathBuilderSheet: PathBuilder.Character,
	options: {
		useStamina: boolean;
		nethysCompendiumEntries?: unknown[];
	}
): Sheet {
	let maxStamina = null;
	let maxResolve = null;
	let hp = null;

	const pathBuilderProfToScore = (prof?: number) => {
		if (!prof || prof < 0) return 0;
		return prof + pathBuilderSheet.level;
	};

	const keyAbility = getPathbuilderAbility(pathBuilderSheet.keyability.trim());

	const modKeys = _.mapKeys(pathBuilderSheet.mods, (_value, key) => key.toLowerCase());
	const modsFixed = _.mapValues(modKeys, value =>
		_.values(value).reduce((acc, currentValue) => {
			if (isNaN(currentValue)) return acc;
			return acc + (currentValue ?? 0);
		}, 0)
	);
	const mods = (key: string) => modsFixed[key.toLowerCase()] ?? 0;

	const baseSheet = getDefaultSheet();
	const nethysItems = createNethysItemMetadataIndex(options.nethysCompendiumEntries ?? []);
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
			(pathBuilderSheet.attributes.classhp / 2 +
				(baseSheet.intProperties.constitution ?? 0)) *
			pathBuilderSheet.level;
		maxResolve = keyAbility ? (baseSheet.intProperties[keyAbility] ?? 0) : 0;
	} else {
		hp =
			pathBuilderSheet.attributes.ancestryhp +
			pathBuilderSheet.attributes.bonushp +
			(pathBuilderSheet.attributes.classhp +
				pathBuilderSheet.attributes.bonushpPerLevel +
				baseSheet.intProperties.constitution) *
				pathBuilderSheet.level;
	}

	for (const spellcasting of pathBuilderSheet.spellCasters) {
		const traditionKey = spellcasting.magicTradition as SheetStatKeys;
		const currentStat = _.cloneDeep(baseSheet.stats[traditionKey]);
		const spellAbility =
			getPathbuilderAbility(spellcasting.ability.trim()) ?? AbilityEnum.intelligence;
		baseSheet.stats[traditionKey].ability = spellAbility;

		applyValuesToStatInPlace(
			baseSheet,
			baseSheet.stats[traditionKey],
			null,
			null,
			spellcasting.proficiency
		);
		if (currentStat.bonus != null && currentStat.bonus > baseSheet.stats[traditionKey].bonus!) {
			baseSheet.stats[traditionKey] = currentStat;
		}
	}

	for (const focusCastingTradition in pathBuilderSheet.focus) {
		if (focusCastingTradition in baseSheet.stats) {
			const traditionKey = focusCastingTradition as SheetStatKeys;
			if (baseSheet.stats[traditionKey].bonus === null) {
				const focusCasting =
					pathBuilderSheet.focus[focusCastingTradition as keyof PathBuilder.Focus];
				const allSpellcastingAbilities = Object.entries(focusCasting ?? {}).map(
					([key, value]) => ({
						attack:
							pathBuilderProfToScore(value?.proficiency ?? 0) +
							(value?.abilityBonus ?? 0) +
							(value?.itemBonus ?? 0),
						proficiency: value?.proficiency ?? 0,
						ability: getPathbuilderAbility(key) ?? null,
					})
				);

				const highestSpellcastingAbility = _.maxBy(allSpellcastingAbilities, 'attack');
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
		let stat: ProficiencyStat | undefined;

		const mappedProperty = PATHBUILDER_PROFICIENCY_MAP[standardizePropKey(statKey)];
		if (mappedProperty?.kind === 'stat') {
			stat = baseSheet.stats[mappedProperty.key];
		} else if (mappedProperty?.kind === 'integer') {
			baseSheet.intProperties[mappedProperty.key] = statProfMod;
			continue;
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

		const statBonus =
			pathBuilderProfToScore(pathBuilderSheet.proficiencies[statKey]) +
			(baseSheet.intProperties[stat.ability ?? AbilityEnum.intelligence] ?? 0) +
			mods(statKey);

		applyValuesToStatInPlace(baseSheet, stat, statBonus, null, statProfMod);
	}

	for (const [loreName, loreProfMod] of pathBuilderSheet.lores ?? []) {
		const loreStat: ProficiencyStat = {
			name: loreName ? `${loreName} Lore` : 'Unknown Lore',
			proficiency: loreProfMod ?? 0,
			bonus: null,
			dc: null,
			note: null,
			ability:
				(loreName ?? '').toLowerCase() === 'esoteric'
					? AbilityEnum.charisma
					: AbilityEnum.intelligence,
		};
		baseSheet.additionalSkills.push(loreStat);
		applyValuesToStatInPlace(baseSheet, loreStat, null, null, loreProfMod ?? 0);
	}

	return {
		staticInfo: {
			name: pathBuilderSheet.name,
			level: pathBuilderSheet.level,
			usesStamina: options.useStamina ?? false,
			keyAbility,
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
			heritage: pathBuilderSheet.heritage.replace(` ${pathBuilderSheet.ancestry}`, ''),
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
			martialProficiency: getHighestProficiency(
				pathBuilderSheet.proficiencies.martial,
				'martial',
				pathBuilderSheet.specificProficiencies
			),
			simpleProficiency: getHighestProficiency(
				pathBuilderSheet.proficiencies.simple,
				'simple',
				pathBuilderSheet.specificProficiencies
			),
			unarmedProficiency: getHighestProficiency(
				pathBuilderSheet.proficiencies.unarmed,
				'unarmed',
				pathBuilderSheet.specificProficiencies
			),
			advancedProficiency: getHighestProficiency(
				pathBuilderSheet.proficiencies.advanced,
				'advanced',
				pathBuilderSheet.specificProficiencies
			),
			heavyProficiency: getHighestProficiency(
				pathBuilderSheet.proficiencies.heavy,
				'heavy',
				pathBuilderSheet.specificProficiencies
			),
			mediumProficiency: getHighestProficiency(
				pathBuilderSheet.proficiencies.medium,
				'medium',
				pathBuilderSheet.specificProficiencies
			),
			lightProficiency: getHighestProficiency(
				pathBuilderSheet.proficiencies.light,
				'light',
				pathBuilderSheet.specificProficiencies
			),
			unarmoredProficiency: getHighestProficiency(
				pathBuilderSheet.proficiencies.unarmored,
				'unarmored',
				pathBuilderSheet.specificProficiencies
			),
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
		counterGroups: baseSheet.counterGroups,
		countersOutsideGroups: baseSheet.countersOutsideGroups,
		defenses: {
			immunities: [],
			weaknesses: [],
			resistances: [],
		},
		stats: baseSheet.stats,
		additionalSkills: baseSheet.additionalSkills,
		attacks: pathBuilderSheet.weapons.map((weapon: PathBuilder.Weapon) => {
			const baseWeapon = nethysItems.findBaseWeapon(String(weapon.name ?? ''));
			const runeMetadata = (weapon.runes ?? [])
				.map(rune => nethysItems.findWeaponRune(String(rune)))
				.filter(Boolean);
			const material = nethysItems.findMaterial(
				weapon.mat == null ? null : String(weapon.mat)
			);
			const attackTraits = _.uniq([
				...(baseWeapon?.traits ?? []),
				...runeMetadata.flatMap(rune => rune?.traits ?? []),
				...(material ? [material.name] : []),
			]);
			const attackTags = attackTraits.map(trait => trait.toLowerCase());
			let numDice = 1;
			if (String(weapon.str).toLowerCase() === 'striking') {
				numDice = 2;
			} else if (String(weapon.str).toLowerCase() === 'greaterstriking') {
				numDice = 3;
			} else if (String(weapon.str).toLowerCase() === 'majorstriking') {
				numDice = 4;
			}

			const damageBonus =
				weapon.damageBonus >= 0 ? `+ ${weapon.damageBonus}` : weapon.damageBonus;
			const mainDamage = {
				dice: `${numDice}${weapon.die ?? ''}${damageBonus}`,
				type: weapon.damageType,
				tags: _.uniq([...attackTags, String(weapon.damageType).toLowerCase()]),
			};
			const extraDamage = (weapon.extraDamage ?? []).map((damage: string) => {
				const [dice, ...type] = damage.split(' ');
				const damageType = type.join(' ');
				return {
					dice,
					type: damageType,
					tags: _.uniq([...attackTags, damageType.toLowerCase()]),
				};
			});

			return {
				name: String(weapon.name),
				toHit: weapon.attack,
				damage: [mainDamage, ...extraDamage],
				effects: [],
				range: baseWeapon?.range ?? null,
				traits: attackTraits,
				notes: null,
			} satisfies SheetAttack;
		}),
	};
}
