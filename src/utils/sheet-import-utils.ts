import _ from 'lodash';
import { Sheet } from '../services/kobold/models/index.js';
import { PathBuilder } from '../services/pathbuilder/pathbuilder.js';
import { CreatureFluff, CreatureStatBlock } from '../services/pf2etools/bestiaryType.js';
import { WG } from '../services/wanderers-guide/wanderers-guide.js';

export function convertBestiaryCreatureToSheet(
	bestiaryEntry: CreatureStatBlock,
	fluffEntry: CreatureFluff,
	options: { useStamina: boolean; challengeAdjustment?: number }
): Sheet {
	let hpAdjustment = 0;

	if (options?.challengeAdjustment && options?.challengeAdjustment > 0) {
		if (bestiaryEntry.level <= 1) {
			hpAdjustment = 10;
		} else if (bestiaryEntry.level <= 4) {
			hpAdjustment = 15;
		} else if (bestiaryEntry.level <= 19) {
			hpAdjustment = 20;
		} else {
			hpAdjustment = 30;
		}
	} else if (options?.challengeAdjustment && options.challengeAdjustment < 0) {
		if (bestiaryEntry.level <= 2) {
			hpAdjustment = -10;
		} else if (bestiaryEntry.level <= 5) {
			hpAdjustment = -15;
		} else if (bestiaryEntry.level <= 20) {
			hpAdjustment = -20;
		} else {
			hpAdjustment = -30;
		}
	}
	hpAdjustment *= Math.abs(options?.challengeAdjustment) ?? 0;

	const rollAdjustment = 2 * options?.challengeAdjustment ?? 0;

	const size = (bestiaryEntry.traits || ['medium']).filter(trait => {
		return ['tiny', 'small', 'medium', 'large', 'huge', 'gargantuan', 'colossal'].includes(
			trait
		);
	});
	let focusPoints = 0;
	for (const castingType of bestiaryEntry?.spellcasting || []) {
		if (castingType.fp) {
			focusPoints += castingType.fp;
		}
		if (focusPoints > 3) focusPoints = 3;
	}

	let spellcastingTotals: {
		arcaneAttack?: number;
		arcaneDC?: number;
		arcaneProfMod?: number;
		divineAttack?: number;
		divineDC?: number;
		divineProfMod?: number;
		occultAttack?: number;
		occultDC?: number;
		occultProfMod?: number;
		primalAttack?: number;
		primalDC?: number;
		primalProfMod?: number;
	} = {};
	for (const spellcasting of bestiaryEntry?.spellcasting || []) {
		if (spellcasting.tradition === 'occult') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				spellcastingTotals.occultAttack =
					Math.max(spellcastingTotals.occultAttack ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				spellcastingTotals.occultDC =
					Math.max(spellcastingTotals.occultDC ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
		if (spellcasting.tradition === 'divine') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				spellcastingTotals.divineAttack =
					Math.max(spellcastingTotals.divineAttack ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				spellcastingTotals.divineDC =
					Math.max(spellcastingTotals.divineDC ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
		if (spellcasting.tradition === 'arcane') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				spellcastingTotals.arcaneAttack =
					Math.max(spellcastingTotals.arcaneAttack ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				spellcastingTotals.arcaneDC =
					Math.max(spellcastingTotals.arcaneDC ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
		if (spellcasting.tradition === 'primal') {
			if (spellcasting.attack !== undefined && spellcasting.attack !== null) {
				spellcastingTotals.primalAttack =
					Math.max(spellcastingTotals.primalAttack ?? -5, spellcasting.attack) +
					rollAdjustment;
			}
			if (spellcasting.DC !== undefined && spellcasting.DC !== null) {
				spellcastingTotals.primalDC =
					Math.max(spellcastingTotals.primalDC ?? 0, spellcasting.DC) + rollAdjustment;
			}
		}
	}
	let skills: Sheet['skills'] = { lores: [] };
	for (const skill in bestiaryEntry.skills) {
		const splitSkill = skill.split(' ');
		if (splitSkill.length > 1) {
			//lore skill
			skills.lores.push({
				name: splitSkill[0],
				bonus: bestiaryEntry.skills[skill].std + rollAdjustment,
				profMod: null,
			});
		} else {
			for (const key in bestiaryEntry.skills[skill]) {
				if (key.includes('note')) {
					continue;
				} else if (key === 'std') {
					skills[skill] = bestiaryEntry.skills[skill][key] + rollAdjustment;
				} else
					skills[skill + ' ' + key.toLowerCase()] =
						bestiaryEntry.skills[skill][key] + rollAdjustment;
			}
		}
	}

	let attacks: Sheet['attacks'] = [];
	for (const attack of bestiaryEntry?.attacks || []) {
		const damageRolls: Sheet['attacks'][0]['damage'] = [];
		const splitDamage = attack.damage.split('{@damage').slice(1);
		for (const damageSplit of splitDamage) {
			const [dice, type] = damageSplit.split('}').map(d => d.trim());
			damageRolls.push({
				dice: dice + (rollAdjustment ? rollAdjustment : ''),
				type,
			});
		}
		attacks.push({
			name: attack.name,
			range: attack.range,
			toHit: attack.attack + rollAdjustment,
			damage: damageRolls,
			traits: attack.traits,
		});
	}

	const sheet: Sheet = {
		info: {
			name: bestiaryEntry.name,
			description: bestiaryEntry.description,
			url: `https://pf2etools.com/bestiary.html#${bestiaryEntry.name.replaceAll(
				' ',
				'%20'
			)}_${bestiaryEntry.source}`,
			gender: null,
			age: null,
			alignment: null,
			deity: null,
			imageURL: fluffEntry?.images?.[0] ?? null,
			level: bestiaryEntry.level,
			size: size?.[0] ?? 'medium',
			class: null,
			keyability: null,
			ancestry: null,
			heritage: null,
			background: null,
			traits: bestiaryEntry.traits || [],
			usesStamina: options.useStamina,
		},
		general: {
			currentHeroPoints: 0,
			speed: bestiaryEntry.speed?.walk,
			flySpeed: bestiaryEntry.speed?.fly,
			swimSpeed: bestiaryEntry.speed?.swim,
			climbSpeed: bestiaryEntry.speed?.climb,
			currentFocusPoints: focusPoints,
			focusPoints,
			classDC: null,
			perception: bestiaryEntry.perception?.std,
			perceptionProfMod: null,
			senses: (bestiaryEntry.senses || [])
				.map(sense => sense?.name)
				.filter(name => name && name?.length),
			languages: bestiaryEntry.languages?.languages || [],
		},
		abilities: {
			strength: bestiaryEntry.abilityMods?.str
				? bestiaryEntry.abilityMods.str * 2 + 10
				: null,
			dexterity: bestiaryEntry.abilityMods?.dex
				? bestiaryEntry.abilityMods.dex * 2 + 10
				: null,
			constitution: bestiaryEntry.abilityMods?.con
				? bestiaryEntry.abilityMods.con * 2 + 10
				: null,
			intelligence: bestiaryEntry.abilityMods?.int
				? bestiaryEntry.abilityMods.int * 2 + 10
				: null,
			wisdom: bestiaryEntry.abilityMods?.wis ? bestiaryEntry.abilityMods.wis * 2 + 10 : null,
			charisma: bestiaryEntry.abilityMods?.cha
				? bestiaryEntry.abilityMods.cha * 2 + 10
				: null,
		},
		defenses: {
			currentHp: (bestiaryEntry.defenses?.hp || []).reduce((acc, hp) => acc + hp.hp, 0),
			maxHp: (bestiaryEntry.defenses?.hp || []).reduce((acc, hp) => acc + hp.hp, 0),
			tempHp: 0,
			currentResolve: 0,
			maxResolve: 0,
			currentStamina: 0,
			maxStamina: 0,
			immunities: bestiaryEntry.defenses?.immunities,
			resistances: (bestiaryEntry.defenses?.resistances || []).map(res => ({
				type: res.name,
				amount: res.amount,
			})),
			weaknesses: (bestiaryEntry.defenses?.weaknesses || []).map(weak => ({
				type: weak.name,
				amount: weak.amount,
			})),
			ac: bestiaryEntry.defenses?.ac?.std,
			heavyProfMod: null,
			mediumProfMod: null,
			lightProfMod: null,
			unarmoredProfMod: null,
		},
		offense: {
			martialProfMod: null,
			simpleProfMod: null,
			unarmedProfMod: null,
			advancedProfMod: null,
		},
		castingStats: {
			arcaneProfMod: null,
			divineProfMod: null,
			occultProfMod: null,
			primalProfMod: null,
			...spellcastingTotals,
		},
		saves: {
			fortitude: bestiaryEntry.defenses?.savingThrows?.fort?.std,
			fortitudeProfMod: null,
			reflex: bestiaryEntry.defenses?.savingThrows?.ref?.std,
			reflexProfMod: null,
			will: bestiaryEntry.defenses?.savingThrows?.will?.std,
			willProfMod: null,
		},
		skills: {
			...skills,
			acrobaticsProfMod: null,
			arcanaProfMod: null,
			athleticsProfMod: null,
			craftingProfMod: null,
			deceptionProfMod: null,
			diplomacyProfMod: null,
			intimidationProfMod: null,
			medicineProfMod: null,
			natureProfMod: null,
			occultismProfMod: null,
			performanceProfMod: null,
			religionProfMod: null,
			societyProfMod: null,
			stealthProfMod: null,
			survivalProfMod: null,
			thieveryProfMod: null,
		},
		attacks,
		rollMacros: [],
		actions: [],
		modifiers: [],
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

	const saves: Sheet['saves'] = calculatedStats.totalSaves.reduce((acc, save) => {
		return {
			...acc,
			[save.Name.toLowerCase()]: save.Bonus,
			[save.Name.toLowerCase() + 'ProfMod']: save.ProficiencyMod,
		};
	}, {}) as any;

	const abilities: Sheet['abilities'] = calculatedStats.totalAbilityScores.reduce(
		(acc, ability) => {
			return {
				...acc,
				[ability.Name.toLowerCase()]: ability.Score,
			};
		},
		{}
	) as any;

	const skills: { [key: string]: any } = calculatedStats.totalSkills.reduce(
		(acc, skill) => {
			// catch lores which are named "Foo Lore"
			let loreSplit = skill.Name.split(' ');
			if (loreSplit.length > 1) {
				let lores = acc.lores;
				lores.push({
					name: loreSplit[0].toLowerCase(),
					bonus: skill.Bonus,
					profMod: skill.ProficiencyMod,
				});
				return {
					...acc,
					lores,
				};
			}
			return {
				...acc,
				[skill.Name.toLowerCase()]: skill.Bonus,
				[skill.Name.toLowerCase() + 'ProfMod']: skill.ProficiencyMod,
			};
		},
		{ lores: [] }
	);

	const sheet: Sheet = {
		info: {
			url: `https://wanderersguide.app/profile/characters/${characterData.id}`,
			name: characterData.name,
			description: null,
			gender: characterData?.infoJSON?.gender,
			age: characterData?.infoJSON?.age,
			alignment: characterData?.infoJSON?.alignment,
			deity: characterData?.infoJSON?.beliefs,
			imageURL: characterData?.infoJSON?.imageURL,
			level: characterData.level,
			size: calculatedStats.generalInfo?.size,
			class: calculatedStats.generalInf?.className,
			keyability: null,
			ancestry,
			heritage,
			background: calculatedStats.generalInfo?.backgroundName,
			traits: calculatedStats.generalInfo?.traits,
			usesStamina: characterData.variantStamina === 1,
		},
		general: {
			currentHeroPoints: characterData.heroPoints,
			speed: calculatedStats.totalSpeed,
			flySpeed: null,
			swimSpeed: null,
			climbSpeed: null,
			currentFocusPoints: null,
			focusPoints: null,
			classDC: calculatedStats.totalClassDC,
			perception: calculatedStats.totalPerception,
			perceptionProfMod: calculatedStats.primalSpellProfMod,
			languages: [],
			senses: [],
		},
		abilities,
		defenses: {
			currentHp: calculatedStats.maxHP,
			maxHp: calculatedStats.maxHP,
			tempHp: 0,
			currentResolve: calculatedStats.maxResolve,
			maxResolve: calculatedStats.maxResolve,
			currentStamina: calculatedStats.maxStamina,
			maxStamina: calculatedStats.maxStamina,
			immunities: [],
			resistances: [],
			weaknesses: [],
			ac: calculatedStats.totalAC,
			heavyProfMod: null,
			mediumProfMod: null,
			lightProfMod: null,
			unarmoredProfMod: null,
		},
		offense: {
			martialProfMod: calculatedStats.martialWeaponProfMod,
			simpleProfMod: calculatedStats.simpleWeaponProfMod,
			unarmedProfMod: calculatedStats.unarmedProfMod,
			advancedProfMod: calculatedStats.advancedWeaponProfMod,
		},
		castingStats: {
			arcaneAttack: calculatedStats.arcaneSpellAttack,
			arcaneDC: calculatedStats.arcaneSpellDC,
			arcaneProfMod: calculatedStats.arcaneSpellProfMod,
			divineAttack: calculatedStats.divineSpellAttack,
			divineDC: calculatedStats.divineSpellDC,
			divineProfMod: calculatedStats.divineSpellProfMod,
			occultAttack: calculatedStats.occultSpellAttack,
			occultDC: calculatedStats.occultSpellDC,
			occultProfMod: calculatedStats.occultSpellProfMod,
			primalAttack: calculatedStats.primalSpellAttack,
			primalDC: calculatedStats.primalSpellDC,
			primalProfMod: calculatedStats.primalSpellProfMod,
		},
		saves: {
			...saves,
		},
		skills: {
			...skills,
		},
		attacks: calculatedStats.weapons.map(weapon => {
			//remove the damage type from the damage string
			const damageComponents = weapon.Damage.split(' ');
			const damageType = damageComponents.pop();
			return {
				name: weapon.Name,
				toHit: weapon.Bonus,
				damage: [{ dice: damageComponents.join(' '), type: damageType }],
				range: null,
				traits: null,
				notes: null,
			};
		}),
		rollMacros: [],
		actions: [],
		modifiers: [],

		sourceData: { calculatedStats, characterData },
	};
	return sheet;
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
	const conMod = Math.floor((pathBuilderSheet.abilities.con - 10) / 2);

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
	const pathBuilderProfToScore = function (prof: number) {
		if (prof > 0) return prof + pathBuilderSheet.level;
		else return 0;
	};
	const scoreToBonus = function (score: number) {
		return Math.floor((score - 10) / 2);
	};

	if (options.useStamina) {
		hp =
			pathBuilderSheet.attributes.ancestryhp +
			pathBuilderSheet.attributes.bonushp +
			(pathBuilderSheet.attributes.classhp / 2 +
				pathBuilderSheet.attributes.bonushpPerLevel) *
				pathBuilderSheet.level;
		maxStamina = (pathBuilderSheet.attributes.classhp / 2 + conMod) * pathBuilderSheet.level;
		maxResolve = pathBuilderSheet.abilities[pathBuilderSheet.keyability];
	} else {
		hp =
			pathBuilderSheet.attributes.ancestryhp +
			pathBuilderSheet.attributes.bonushp +
			(pathBuilderSheet.attributes.classhp +
				pathBuilderSheet.attributes.bonushpPerLevel +
				conMod) *
				pathBuilderSheet.level;
	}

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

	const sheet: Sheet = {
		info: {
			name: pathBuilderSheet.name,
			description: null,
			url: '',
			gender: pathBuilderSheet.gender,
			age: isNaN(pathBuilderSheet.age) ? null : Number(pathBuilderSheet.age),
			alignment: pathBuilderSheet.alignment,
			deity: pathBuilderSheet.deity,
			imageURL: '',
			level: pathBuilderSheet.level,
			size: sizeToString(pathBuilderSheet.size),
			class: pathBuilderSheet.class,
			keyability: pathBuilderSheet.keyability,
			ancestry: pathBuilderSheet.ancestry,
			heritage: pathBuilderSheet.heritage.replace(' ' + pathBuilderSheet.ancestry, ''),
			background: pathBuilderSheet.background,
			traits: [],
			usesStamina: options.useStamina,
		},
		general: {
			currentHeroPoints: 0,
			speed: pathBuilderSheet.attributes.speed + pathBuilderSheet.attributes.speedBonus,
			flySpeed: null,
			swimSpeed: null,
			climbSpeed: null,
			currentFocusPoints: 0,
			focusPoints: pathBuilderSheet.focusPoints,
			classDC: 10 + pathBuilderProfToScore(pathBuilderSheet.proficiencies.classDC),
			perception:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.perception) +
				pathBuilderSheet.abilities.wis +
				mods('perception'),
			perceptionProfMod: pathBuilderSheet.proficiencies.perception,
			languages: pathBuilderSheet.languages || [],
			senses: [],
		},
		abilities: {
			strength: pathBuilderSheet.abilities.str + mods('strength'),
			dexterity: pathBuilderSheet.abilities.dex + mods('dexterity'),
			constitution: pathBuilderSheet.abilities.con + mods('constitution'),
			intelligence: pathBuilderSheet.abilities.int + mods('intelligence'),
			wisdom: pathBuilderSheet.abilities.wis + mods('wisdom'),
			charisma: pathBuilderSheet.abilities.cha + mods('charisma'),
		},
		defenses: {
			currentHp: hp,
			maxHp: hp,
			tempHp: 0,
			currentResolve: maxResolve,
			maxResolve,
			currentStamina: maxStamina,
			maxStamina: maxStamina,
			immunities: [],
			resistances: [],
			weaknesses: [],
			ac: pathBuilderSheet.acTotal.acTotal,
			heavyProfMod: pathBuilderSheet.proficiencies.heavy,
			mediumProfMod: pathBuilderSheet.proficiencies.medium,
			lightProfMod: pathBuilderSheet.proficiencies.light,
			unarmoredProfMod: pathBuilderSheet.proficiencies.unarmored,
		},
		offense: {
			martialProfMod: pathBuilderSheet.proficiencies.martial,
			simpleProfMod: pathBuilderSheet.proficiencies.simple,
			unarmedProfMod: pathBuilderSheet.proficiencies.unarmed,
			advancedProfMod: pathBuilderSheet.proficiencies.advanced,
		},
		castingStats: {
			arcaneAttack: null,
			arcaneDC: null,
			arcaneProfMod: pathBuilderSheet.proficiencies.castingArcane,
			divineAttack: null,
			divineDC: null,
			divineProfMod: pathBuilderSheet.proficiencies.castingDivine,
			occultAttack: null,
			occultDC: null,
			occultProfMod: pathBuilderSheet.proficiencies.castingOccult,
			primalAttack: null,
			primalDC: null,
			primalProfMod: pathBuilderSheet.proficiencies.castingPrimal,
		},
		saves: {
			fortitude:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.fortitude) +
				scoreToBonus(pathBuilderSheet.abilities.con) +
				mods('fortitude'),
			fortitudeProfMod: pathBuilderSheet.proficiencies.fortitude,
			reflex:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.reflex) +
				scoreToBonus(pathBuilderSheet.abilities.dex) +
				mods('reflex'),
			reflexProfMod: pathBuilderSheet.proficiencies.reflex,
			will:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.will) +
				scoreToBonus(pathBuilderSheet.abilities.wis),
			willProfMod: pathBuilderSheet.proficiencies.will + mods('will'),
		},
		skills: {
			acrobatics:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.acrobatics) +
				scoreToBonus(pathBuilderSheet.abilities.dex) +
				mods('acrobatics'),
			acrobaticsProfMod: pathBuilderSheet.proficiencies.acrobatics,
			arcana:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.arcana) +
				scoreToBonus(pathBuilderSheet.abilities.int) +
				mods('arcana'),
			arcanaProfMod: pathBuilderSheet.proficiencies.arcana,
			athletics:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.athletics) +
				scoreToBonus(pathBuilderSheet.abilities.str) +
				mods('athletics'),
			athleticsProfMod: pathBuilderSheet.proficiencies.athletics,
			crafting:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.crafting) +
				scoreToBonus(pathBuilderSheet.abilities.int) +
				mods('crafting'),
			craftingProfMod: pathBuilderSheet.proficiencies.crafting,
			deception:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.deception) +
				scoreToBonus(pathBuilderSheet.abilities.cha) +
				mods('deception'),
			deceptionProfMod: pathBuilderSheet.proficiencies.deception,
			diplomacy:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.diplomacy) +
				scoreToBonus(pathBuilderSheet.abilities.cha) +
				mods('diplomacy'),
			diplomacyProfMod: pathBuilderSheet.proficiencies.diplomacy,
			intimidation:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.intimidation) +
				scoreToBonus(pathBuilderSheet.abilities.cha) +
				mods('intimidation'),
			intimidationProfMod: pathBuilderSheet.proficiencies.intimidation,
			medicine:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.medicine) +
				scoreToBonus(pathBuilderSheet.abilities.wis) +
				mods('medicine'),
			medicineProfMod: pathBuilderSheet.proficiencies.medicine,
			nature:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.nature) +
				scoreToBonus(pathBuilderSheet.abilities.wis) +
				mods('nature'),
			natureProfMod: pathBuilderSheet.proficiencies.nature,
			occultism:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.occultism) +
				scoreToBonus(pathBuilderSheet.abilities.int) +
				mods('occultism'),
			occultismProfMod: pathBuilderSheet.proficiencies.occultism,
			performance:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.performance) +
				scoreToBonus(pathBuilderSheet.abilities.cha) +
				mods('performance'),
			performanceProfMod: pathBuilderSheet.proficiencies.performance,
			religion:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.religion) +
				scoreToBonus(pathBuilderSheet.abilities.wis) +
				mods('religion'),
			religionProfMod: pathBuilderSheet.proficiencies.religion,
			society:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.society) +
				scoreToBonus(pathBuilderSheet.abilities.int) +
				mods('society'),
			societyProfMod: pathBuilderSheet.proficiencies.society,
			stealth:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.stealth) +
				scoreToBonus(pathBuilderSheet.abilities.dex) +
				mods('stealth'),
			stealthProfMod: pathBuilderSheet.proficiencies.stealth,
			survival:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.survival) +
				scoreToBonus(pathBuilderSheet.abilities.wis) +
				mods('survival'),
			survivalProfMod: pathBuilderSheet.proficiencies.survival,
			thievery:
				pathBuilderProfToScore(pathBuilderSheet.proficiencies.thievery) +
				scoreToBonus(pathBuilderSheet.abilities.dex) +
				mods('thievery'),
			thieveryProfMod: pathBuilderSheet.proficiencies.thievery,
			lores: pathBuilderSheet.lores.map(lore => ({
				name: lore[0],
				profMod: lore[1],
				bonus:
					pathBuilderProfToScore(lore[1]) +
					scoreToBonus(pathBuilderSheet.abilities.int) +
					mods(lore[0] + ' lore'),
			})),
		},
		attacks: pathBuilderSheet.weapons.map(weapon => {
			const mainDamage = {
				dice: weapon.pot + weapon.die + weapon.damageBonus,
				// base type isn't provided by pathbuilder
			};
			const extraDamage = weapon.extraDamage.map(damage => {
				const [dice, ...type] = damage.split(' ');
				return {
					dice,
					type: type.join(' '),
				};
			});
			return {
				name: weapon.name,
				toHit: weapon.attack,
				damage: [mainDamage, ...extraDamage],
			};
		}),
		rollMacros: [],
		actions: [],
		modifiers: [],
		sourceData: pathBuilderSheet,
	};

	const shorthandAbilityToLong = {
		str: 'strength',
		dex: 'dexterity',
		con: 'constitution',
		int: 'intelligence',
		wis: 'wisdom',
		cha: 'charisma',
	};

	for (const spellcasting of pathBuilderSheet.spellCasters) {
		console.log(
			spellcasting.ability,
			sheet.abilities[shorthandAbilityToLong[spellcasting.ability]],
			scoreToBonus(sheet.abilities[shorthandAbilityToLong[spellcasting.ability]])
		);
		const spellAttack =
			pathBuilderProfToScore(spellcasting.proficiency) +
			scoreToBonus(sheet.abilities[shorthandAbilityToLong[spellcasting.ability]]);
		const spellDC = 10 + spellAttack;

		sheet.castingStats[spellcasting.magicTradition + 'Attack'] = spellAttack;
		sheet.castingStats[spellcasting.magicTradition + 'DC'] = spellDC;
		sheet.castingStats[spellcasting.magicTradition + 'ProfMod'] = spellcasting.proficiency;
	}
	for (const focusCastingTradition in pathBuilderSheet.focus) {
		if (!sheet.castingStats[focusCastingTradition + 'DC']) {
			const focusCasting = pathBuilderSheet.focus[focusCastingTradition];
			const allSpellcastingAbilities: { attack: number; proficiency: number }[] =
				Object.values(
					_.mapValues(focusCasting, (value, key) => ({
						attack:
							pathBuilderProfToScore(value.proficiency) +
							value.abilityBonus +
							value.itemBonus,
						proficiency: value.proficiency,
					}))
				);
			const highestSpellcastingAbility = _.maxBy<{ attack: number; proficiency: number }>(
				allSpellcastingAbilities,
				'attack'
			);
			if (!sheet.castingStats[focusCastingTradition + 'Attack']) {
				sheet.castingStats[focusCastingTradition + 'Attack'] =
					highestSpellcastingAbility.attack;
				sheet.castingStats[focusCastingTradition + 'DC'] =
					10 + highestSpellcastingAbility.attack;
				sheet.castingStats[focusCastingTradition + 'ProfMod'] =
					10 + highestSpellcastingAbility.proficiency;
			}
		}
	}

	return sheet;
}
