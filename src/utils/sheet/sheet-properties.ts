import _ from 'lodash';
import {
	AbilityEnum,
	Sheet,
	SheetBaseCounterKeys,
	SheetBaseCounters,
	SheetInfo,
	SheetInfoLists,
	SheetIntegerKeys,
	SheetIntegers,
	SheetStatKeys,
	SheetStats,
	SheetWeaknessesResistances,
	StatSubGroupEnum,
	getDefaultSheet,
} from '../../services/kobold/index.js';
import { literalKeys } from '../type-guards.js';

function standardizePropKey(name: string): string {
	return name.toLowerCase().trim().replaceAll(/_|-/g, '');
}
function standardizeCustomPropName(name: string): string {
	return _.kebabCase(name.trim()).replaceAll('-', ' ');
}

export class SheetInfoProperties {
	constructor(protected sheetInfo: SheetInfo) {}
	public static properties: Record<keyof SheetInfo, { aliases: string[] }> = {
		imageURL: { aliases: ['image', 'imagelink'] },
		url: { aliases: [] },
		description: { aliases: [] },
		gender: { aliases: [] },
		age: { aliases: [] },
		alignment: { aliases: [] },
		deity: { aliases: [] },
		size: { aliases: [] },
		class: { aliases: [] },
		ancestry: { aliases: [] },
		heritage: { aliases: [] },
		background: { aliases: [] },
	};

	public static get _aliases(): { [k: string]: undefined | keyof SheetInfo } {
		const aliases: { [k: string]: undefined | keyof SheetInfo } = {};
		for (const [key, value] of Object.entries(SheetInfoProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as keyof SheetInfo;
			}
			aliases[standardizePropKey(key)] = key as keyof SheetInfo;
		}
		return aliases;
	}
	public static aliases = SheetInfoProperties._aliases;
}

export class SheetInfoListProperties {
	constructor(protected sheetInfo: SheetInfoLists) {}
	public static properties: Record<keyof SheetInfoLists, { aliases: string[] }> = {
		traits: { aliases: ['trait'] },
		languages: { aliases: ['language'] },
		senses: { aliases: ['sense'] },
		immunities: { aliases: ['immune'] },
	};

	public static get _aliases(): { [k: string]: undefined | keyof SheetInfoLists } {
		const aliases: { [k: string]: undefined | keyof SheetInfoLists } = {};
		for (const [key, value] of Object.entries(SheetInfoListProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as keyof SheetInfoLists;
			}
			aliases[standardizePropKey(key)] = key as keyof SheetInfoLists;
		}
		return aliases;
	}
	public static aliases = SheetInfoListProperties._aliases;
}

export enum SheetIntegerGroupEnum {
	'ac' = 'ac',
	'abilities' = 'abilities',
	'speeds' = 'speeds',
	'armorProficiencies' = 'armorProficiencies',
	'weaponProficiencies' = 'weaponProficiencies',
}

export class SheetIntegerProperties {
	constructor(protected sheetIntegers: SheetIntegers) {}

	public static statGroups: Record<SheetIntegerGroupEnum, SheetIntegerKeys[]> = {
		[SheetIntegerGroupEnum.ac]: [SheetIntegerKeys.ac],
		[SheetIntegerGroupEnum.abilities]: [
			SheetIntegerKeys.strength,
			SheetIntegerKeys.dexterity,
			SheetIntegerKeys.constitution,
			SheetIntegerKeys.intelligence,
			SheetIntegerKeys.wisdom,
			SheetIntegerKeys.charisma,
		],
		[SheetIntegerGroupEnum.speeds]: [
			SheetIntegerKeys.walkSpeed,
			SheetIntegerKeys.flySpeed,
			SheetIntegerKeys.swimSpeed,
			SheetIntegerKeys.climbSpeed,
			SheetIntegerKeys.burrowSpeed,
			SheetIntegerKeys.dimensionalSpeed,
		],
		[SheetIntegerGroupEnum.armorProficiencies]: [
			SheetIntegerKeys.unarmoredProficiency,
			SheetIntegerKeys.lightProficiency,
			SheetIntegerKeys.mediumProficiency,
			SheetIntegerKeys.heavyProficiency,
		],
		[SheetIntegerGroupEnum.weaponProficiencies]: [
			SheetIntegerKeys.unarmedProficiency,
			SheetIntegerKeys.simpleProficiency,
			SheetIntegerKeys.martialProficiency,
			SheetIntegerKeys.advancedProficiency,
		],
	};

	public static properties: Record<SheetIntegerKeys, { aliases: string[] }> = {
		ac: { aliases: ['armor', 'armorclass'] },
		// Ability Scores
		strength: { aliases: ['str'] },
		dexterity: { aliases: ['dex'] },
		constitution: { aliases: ['con'] },
		intelligence: { aliases: ['int'] },
		wisdom: { aliases: ['wis'] },
		charisma: { aliases: ['cha'] },
		// Speeds
		walkSpeed: { aliases: ['walk', 'speed'] },
		flySpeed: { aliases: ['fly'] },
		swimSpeed: { aliases: ['swim'] },
		climbSpeed: { aliases: ['climb'] },
		burrowSpeed: { aliases: ['burrow'] },
		dimensionalSpeed: { aliases: ['dimensional'] },
		// Extra Proficiencies
		heavyProficiency: { aliases: ['heavy'] },
		mediumProficiency: { aliases: ['medium'] },
		lightProficiency: { aliases: ['light'] },
		unarmoredProficiency: { aliases: ['unarmored'] },
		martialProficiency: { aliases: ['martial'] },
		simpleProficiency: { aliases: ['simple'] },
		unarmedProficiency: { aliases: ['unarmed'] },
		advancedProficiency: { aliases: ['advanced'] },
	};

	public static get _aliases(): { [k: string]: undefined | SheetIntegerKeys } {
		const aliases: { [k: string]: undefined | SheetIntegerKeys } = {};
		for (const [key, value] of Object.entries(SheetIntegerProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as SheetIntegerKeys;
			}
			aliases[standardizePropKey(key)] = key as SheetIntegerKeys;
		}
		return aliases;
	}
	public static aliases = SheetIntegerProperties._aliases;
}

export class SheetBaseCounterProperties {
	constructor(protected sheetBaseCounters: SheetBaseCounters) {}
	public static properties: Record<SheetBaseCounterKeys, { aliases: string[] }> = {
		heroPoints: { aliases: ['maxheropoints'] },
		focusPoints: { aliases: ['fp', 'maxfp', 'maxfocuspoints'] },
		hp: { aliases: ['health', 'hitpoints', 'maxhp', 'maxhealth', 'maxhitpoints'] },
		tempHp: { aliases: ['temphealth', 'temphitpoints'] },
		stamina: { aliases: ['stam', 'maxstam', 'maxstamina'] },
		resolve: { aliases: ['maxresolve'] },
	};

	public static get _aliases(): { [k: string]: undefined | SheetBaseCounterKeys } {
		const aliases: { [k: string]: undefined | SheetBaseCounterKeys } = {};
		for (const [key, value] of Object.entries(SheetBaseCounterProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as SheetBaseCounterKeys;
			}
			aliases[standardizePropKey(key)] = key as SheetBaseCounterKeys;
		}
		return aliases;
	}
	public static aliases = SheetBaseCounterProperties._aliases;
}

export enum StatGroupEnum {
	casting = 'casting',
	class = 'class',
	checks = 'checks',
	saves = 'saves',
	skills = 'skills',
}

export class SheetStatProperties {
	constructor(protected sheetStats: SheetStats) {}

	public static statGroups: Record<StatGroupEnum, SheetStatKeys[]> = {
		[StatGroupEnum.casting]: [
			SheetStatKeys.arcane,
			SheetStatKeys.divine,
			SheetStatKeys.occult,
			SheetStatKeys.primal,
		],
		[StatGroupEnum.class]: [SheetStatKeys.class],
		[StatGroupEnum.checks]: [SheetStatKeys.perception],
		[StatGroupEnum.saves]: [SheetStatKeys.fortitude, SheetStatKeys.reflex, SheetStatKeys.will],
		[StatGroupEnum.skills]: [
			SheetStatKeys.acrobatics,
			SheetStatKeys.arcana,
			SheetStatKeys.athletics,
			SheetStatKeys.crafting,
			SheetStatKeys.deception,
			SheetStatKeys.diplomacy,
			SheetStatKeys.intimidation,
			SheetStatKeys.medicine,
			SheetStatKeys.nature,
			SheetStatKeys.occultism,
			SheetStatKeys.performance,
			SheetStatKeys.religion,
			SheetStatKeys.society,
			SheetStatKeys.stealth,
			SheetStatKeys.survival,
			SheetStatKeys.thievery,
		],
	};

	public static properties: Record<
		`${SheetStatKeys}${Capitalize<StatSubGroupEnum>}`,
		{ aliases: string[]; baseKey: SheetStatKeys; subKey: StatSubGroupEnum }
	> = {
		// casting
		arcaneBonus: {
			aliases: ['arcane', 'arcanetotal', 'arcaneattack', 'arcaneatk'],
			baseKey: SheetStatKeys.arcane,
			subKey: StatSubGroupEnum.bonus,
		},
		arcaneDc: {
			aliases: ['arcanetotaldc'],
			baseKey: SheetStatKeys.arcane,
			subKey: StatSubGroupEnum.dc,
		},
		arcaneProficiency: {
			aliases: ['arcaneprof'],
			baseKey: SheetStatKeys.arcane,
			subKey: StatSubGroupEnum.proficiency,
		},
		arcaneAbility: {
			aliases: [],
			baseKey: SheetStatKeys.arcane,
			subKey: StatSubGroupEnum.ability,
		},
		divineBonus: {
			aliases: ['divine', 'divinetotal', 'divineattack', 'divineatk'],
			baseKey: SheetStatKeys.divine,
			subKey: StatSubGroupEnum.bonus,
		},
		divineDc: {
			aliases: ['divinetotaldc'],
			baseKey: SheetStatKeys.divine,
			subKey: StatSubGroupEnum.dc,
		},
		divineProficiency: {
			aliases: ['divineprof'],
			baseKey: SheetStatKeys.divine,
			subKey: StatSubGroupEnum.proficiency,
		},
		divineAbility: {
			aliases: [],
			baseKey: SheetStatKeys.divine,
			subKey: StatSubGroupEnum.ability,
		},
		occultBonus: {
			aliases: ['occult', 'occulttotal', 'occultattack', 'occultatk'],
			baseKey: SheetStatKeys.occult,
			subKey: StatSubGroupEnum.bonus,
		},
		occultDc: {
			aliases: ['occulttotaldc'],
			baseKey: SheetStatKeys.occult,
			subKey: StatSubGroupEnum.dc,
		},
		occultProficiency: {
			aliases: ['occultprof'],
			baseKey: SheetStatKeys.occult,
			subKey: StatSubGroupEnum.proficiency,
		},
		occultAbility: {
			aliases: [],
			baseKey: SheetStatKeys.occult,
			subKey: StatSubGroupEnum.ability,
		},
		primalBonus: {
			aliases: ['primal', 'primaltotal', 'primalattack', 'primalatk'],
			baseKey: SheetStatKeys.primal,
			subKey: StatSubGroupEnum.bonus,
		},
		primalDc: {
			aliases: ['primaltotaldc'],
			baseKey: SheetStatKeys.primal,
			subKey: StatSubGroupEnum.dc,
		},
		primalProficiency: {
			aliases: ['primalprof'],
			baseKey: SheetStatKeys.primal,
			subKey: StatSubGroupEnum.proficiency,
		},
		primalAbility: {
			aliases: [],
			baseKey: SheetStatKeys.primal,
			subKey: StatSubGroupEnum.ability,
		},
		// Class attack/Dc
		classBonus: {
			aliases: ['class', 'classtotal', 'classattack', 'classatk'],
			baseKey: SheetStatKeys.class,
			subKey: StatSubGroupEnum.bonus,
		},
		classDc: {
			aliases: ['classtotaldc'],
			baseKey: SheetStatKeys.class,
			subKey: StatSubGroupEnum.dc,
		},
		classProficiency: {
			aliases: ['classprof'],
			baseKey: SheetStatKeys.class,
			subKey: StatSubGroupEnum.proficiency,
		},
		classAbility: {
			aliases: [],
			baseKey: SheetStatKeys.class,
			subKey: StatSubGroupEnum.ability,
		},
		// perception
		perceptionBonus: {
			aliases: ['perception', 'perceptiontotal', 'perceptionattack', 'perceptionatk'],
			baseKey: SheetStatKeys.perception,
			subKey: StatSubGroupEnum.bonus,
		},
		perceptionDc: {
			aliases: ['perceptiontotaldc'],
			baseKey: SheetStatKeys.perception,
			subKey: StatSubGroupEnum.dc,
		},
		perceptionProficiency: {
			aliases: ['perceptionprof'],
			baseKey: SheetStatKeys.perception,
			subKey: StatSubGroupEnum.proficiency,
		},
		perceptionAbility: {
			aliases: [],
			baseKey: SheetStatKeys.perception,
			subKey: StatSubGroupEnum.ability,
		},
		// saves
		fortitudeBonus: {
			aliases: ['fortitude', 'fortitudetotal', 'fortitudeattack', 'fortitudeatk'],
			baseKey: SheetStatKeys.fortitude,
			subKey: StatSubGroupEnum.bonus,
		},
		fortitudeDc: {
			aliases: ['fortitudetotaldc'],
			baseKey: SheetStatKeys.fortitude,
			subKey: StatSubGroupEnum.dc,
		},
		fortitudeProficiency: {
			aliases: ['fortitudeprof'],
			baseKey: SheetStatKeys.fortitude,
			subKey: StatSubGroupEnum.proficiency,
		},
		fortitudeAbility: {
			aliases: [],
			baseKey: SheetStatKeys.fortitude,
			subKey: StatSubGroupEnum.ability,
		},
		reflexBonus: {
			aliases: ['reflex', 'reflextotal', 'reflexattack', 'reflexatk'],
			baseKey: SheetStatKeys.reflex,
			subKey: StatSubGroupEnum.bonus,
		},
		reflexDc: {
			aliases: ['reflextotaldc'],
			baseKey: SheetStatKeys.reflex,
			subKey: StatSubGroupEnum.dc,
		},
		reflexProficiency: {
			aliases: ['reflexprof'],
			baseKey: SheetStatKeys.reflex,
			subKey: StatSubGroupEnum.proficiency,
		},
		reflexAbility: {
			aliases: [],
			baseKey: SheetStatKeys.reflex,
			subKey: StatSubGroupEnum.ability,
		},
		willBonus: {
			aliases: ['will', 'willtotal', 'willattack', 'willatk'],
			baseKey: SheetStatKeys.will,
			subKey: StatSubGroupEnum.bonus,
		},
		willDc: {
			aliases: ['willtotaldc'],
			baseKey: SheetStatKeys.will,
			subKey: StatSubGroupEnum.dc,
		},
		willProficiency: {
			aliases: ['willprof'],
			baseKey: SheetStatKeys.will,
			subKey: StatSubGroupEnum.proficiency,
		},
		willAbility: { aliases: [], baseKey: SheetStatKeys.will, subKey: StatSubGroupEnum.ability },
		// skills
		acrobaticsBonus: {
			aliases: ['acrobatics', 'acrobaticstotal', 'acrobaticsattack', 'acrobaticsatk'],
			baseKey: SheetStatKeys.acrobatics,
			subKey: StatSubGroupEnum.bonus,
		},
		acrobaticsDc: {
			aliases: ['acrobaticstotaldc'],
			baseKey: SheetStatKeys.acrobatics,
			subKey: StatSubGroupEnum.dc,
		},
		acrobaticsProficiency: {
			aliases: ['acrobaticsprof'],
			baseKey: SheetStatKeys.acrobatics,
			subKey: StatSubGroupEnum.proficiency,
		},
		acrobaticsAbility: {
			aliases: [],
			baseKey: SheetStatKeys.acrobatics,
			subKey: StatSubGroupEnum.ability,
		},
		arcanaBonus: {
			aliases: ['arcana', 'arcanatotal', 'arcanaattack', 'arcanaatk'],
			baseKey: SheetStatKeys.arcana,
			subKey: StatSubGroupEnum.bonus,
		},
		arcanaDc: {
			aliases: ['arcanatotaldc'],
			baseKey: SheetStatKeys.arcana,
			subKey: StatSubGroupEnum.dc,
		},
		arcanaProficiency: {
			aliases: ['arcanaprof'],
			baseKey: SheetStatKeys.arcana,
			subKey: StatSubGroupEnum.proficiency,
		},
		arcanaAbility: {
			aliases: [],
			baseKey: SheetStatKeys.arcana,
			subKey: StatSubGroupEnum.ability,
		},
		athleticsBonus: {
			aliases: ['athletics', 'athleticstotal', 'athleticsattack', 'athleticsatk'],
			baseKey: SheetStatKeys.athletics,
			subKey: StatSubGroupEnum.bonus,
		},
		athleticsDc: {
			aliases: ['athleticstotaldc'],
			baseKey: SheetStatKeys.athletics,
			subKey: StatSubGroupEnum.dc,
		},
		athleticsProficiency: {
			aliases: ['athleticsprof'],
			baseKey: SheetStatKeys.athletics,
			subKey: StatSubGroupEnum.proficiency,
		},
		athleticsAbility: {
			aliases: [],
			baseKey: SheetStatKeys.athletics,
			subKey: StatSubGroupEnum.ability,
		},
		craftingBonus: {
			aliases: ['crafting', 'craftingtotal', 'craftingattack', 'craftingatk'],
			baseKey: SheetStatKeys.crafting,
			subKey: StatSubGroupEnum.bonus,
		},
		craftingDc: {
			aliases: ['craftingtotaldc'],
			baseKey: SheetStatKeys.crafting,
			subKey: StatSubGroupEnum.dc,
		},
		craftingProficiency: {
			aliases: ['craftingprof'],
			baseKey: SheetStatKeys.crafting,
			subKey: StatSubGroupEnum.proficiency,
		},
		craftingAbility: {
			aliases: [],
			baseKey: SheetStatKeys.crafting,
			subKey: StatSubGroupEnum.ability,
		},
		deceptionBonus: {
			aliases: ['deception', 'deceptiontotal', 'deceptionattack', 'deceptionatk'],
			baseKey: SheetStatKeys.deception,
			subKey: StatSubGroupEnum.bonus,
		},
		deceptionDc: {
			aliases: ['deceptiontotaldc'],
			baseKey: SheetStatKeys.deception,
			subKey: StatSubGroupEnum.dc,
		},
		deceptionProficiency: {
			aliases: ['deceptionprof'],
			baseKey: SheetStatKeys.deception,
			subKey: StatSubGroupEnum.proficiency,
		},
		deceptionAbility: {
			aliases: [],
			baseKey: SheetStatKeys.deception,
			subKey: StatSubGroupEnum.ability,
		},
		diplomacyBonus: {
			aliases: ['diplomacy', 'diplomacytotal', 'diplomacyattack', 'diplomacyatk'],
			baseKey: SheetStatKeys.diplomacy,
			subKey: StatSubGroupEnum.bonus,
		},
		diplomacyDc: {
			aliases: ['diplomacytotaldc'],
			baseKey: SheetStatKeys.diplomacy,
			subKey: StatSubGroupEnum.dc,
		},
		diplomacyProficiency: {
			aliases: ['diplomacyprof'],
			baseKey: SheetStatKeys.diplomacy,
			subKey: StatSubGroupEnum.proficiency,
		},
		diplomacyAbility: {
			aliases: [],
			baseKey: SheetStatKeys.diplomacy,
			subKey: StatSubGroupEnum.ability,
		},
		intimidationBonus: {
			aliases: ['intimidation', 'intimidationtotal', 'intimidationattack', 'intimidationatk'],
			baseKey: SheetStatKeys.intimidation,
			subKey: StatSubGroupEnum.bonus,
		},
		intimidationDc: {
			aliases: ['intimidationtotaldc'],
			baseKey: SheetStatKeys.intimidation,
			subKey: StatSubGroupEnum.dc,
		},
		intimidationProficiency: {
			aliases: ['intimidationprof'],
			baseKey: SheetStatKeys.intimidation,
			subKey: StatSubGroupEnum.proficiency,
		},
		intimidationAbility: {
			aliases: [],
			baseKey: SheetStatKeys.intimidation,
			subKey: StatSubGroupEnum.ability,
		},
		medicineBonus: {
			aliases: ['medicine', 'medicinetotal', 'medicineattack', 'medicineatk'],
			baseKey: SheetStatKeys.medicine,
			subKey: StatSubGroupEnum.bonus,
		},
		medicineDc: {
			aliases: ['medicinetotaldc'],
			baseKey: SheetStatKeys.medicine,
			subKey: StatSubGroupEnum.dc,
		},
		medicineProficiency: {
			aliases: ['medicineprof'],
			baseKey: SheetStatKeys.medicine,
			subKey: StatSubGroupEnum.proficiency,
		},
		medicineAbility: {
			aliases: [],
			baseKey: SheetStatKeys.medicine,
			subKey: StatSubGroupEnum.ability,
		},
		natureBonus: {
			aliases: ['nature', 'naturetotal', 'natureattack', 'natureatk'],
			baseKey: SheetStatKeys.nature,
			subKey: StatSubGroupEnum.bonus,
		},
		natureDc: {
			aliases: ['naturetotaldc'],
			baseKey: SheetStatKeys.nature,
			subKey: StatSubGroupEnum.dc,
		},
		natureProficiency: {
			aliases: ['natureprof'],
			baseKey: SheetStatKeys.nature,
			subKey: StatSubGroupEnum.proficiency,
		},
		natureAbility: {
			aliases: [],
			baseKey: SheetStatKeys.nature,
			subKey: StatSubGroupEnum.ability,
		},
		occultismBonus: {
			aliases: ['occultism', 'occultismtotal', 'occultismattack', 'occultismatk'],
			baseKey: SheetStatKeys.occultism,
			subKey: StatSubGroupEnum.bonus,
		},
		occultismDc: {
			aliases: ['occultismtotaldc'],
			baseKey: SheetStatKeys.occultism,
			subKey: StatSubGroupEnum.dc,
		},
		occultismProficiency: {
			aliases: ['occultismprof'],
			baseKey: SheetStatKeys.occultism,
			subKey: StatSubGroupEnum.proficiency,
		},
		occultismAbility: {
			aliases: [],
			baseKey: SheetStatKeys.occultism,
			subKey: StatSubGroupEnum.ability,
		},
		performanceBonus: {
			aliases: ['performance', 'performancetotal', 'performanceattack', 'performanceatk'],
			baseKey: SheetStatKeys.performance,
			subKey: StatSubGroupEnum.bonus,
		},
		performanceDc: {
			aliases: ['performancetotaldc'],
			baseKey: SheetStatKeys.performance,
			subKey: StatSubGroupEnum.dc,
		},
		performanceProficiency: {
			aliases: ['performanceprof'],
			baseKey: SheetStatKeys.performance,
			subKey: StatSubGroupEnum.proficiency,
		},
		performanceAbility: {
			aliases: [],
			baseKey: SheetStatKeys.performance,
			subKey: StatSubGroupEnum.ability,
		},
		religionBonus: {
			aliases: ['religion', 'religiontotal', 'religionattack', 'religionatk'],
			baseKey: SheetStatKeys.religion,
			subKey: StatSubGroupEnum.bonus,
		},
		religionDc: {
			aliases: ['religiontotaldc'],
			baseKey: SheetStatKeys.religion,
			subKey: StatSubGroupEnum.dc,
		},
		religionProficiency: {
			aliases: ['religionprof'],
			baseKey: SheetStatKeys.religion,
			subKey: StatSubGroupEnum.proficiency,
		},
		religionAbility: {
			aliases: [],
			baseKey: SheetStatKeys.religion,
			subKey: StatSubGroupEnum.ability,
		},
		societyBonus: {
			aliases: ['society', 'societytotal', 'societyattack', 'societyatk'],
			baseKey: SheetStatKeys.society,
			subKey: StatSubGroupEnum.bonus,
		},
		societyDc: {
			aliases: ['societytotaldc'],
			baseKey: SheetStatKeys.society,
			subKey: StatSubGroupEnum.dc,
		},
		societyProficiency: {
			aliases: ['societyprof'],
			baseKey: SheetStatKeys.society,
			subKey: StatSubGroupEnum.proficiency,
		},
		societyAbility: {
			aliases: [],
			baseKey: SheetStatKeys.society,
			subKey: StatSubGroupEnum.ability,
		},
		stealthBonus: {
			aliases: ['stealth', 'stealthtotal', 'stealthattack', 'stealthatk'],
			baseKey: SheetStatKeys.stealth,
			subKey: StatSubGroupEnum.bonus,
		},
		stealthDc: {
			aliases: ['stealthtotaldc'],
			baseKey: SheetStatKeys.stealth,
			subKey: StatSubGroupEnum.dc,
		},
		stealthProficiency: {
			aliases: ['stealthprof'],
			baseKey: SheetStatKeys.stealth,
			subKey: StatSubGroupEnum.proficiency,
		},
		stealthAbility: {
			aliases: [],
			baseKey: SheetStatKeys.stealth,
			subKey: StatSubGroupEnum.ability,
		},
		survivalBonus: {
			aliases: ['survival', 'survivaltotal', 'survivalattack', 'survivalatk'],
			baseKey: SheetStatKeys.survival,
			subKey: StatSubGroupEnum.bonus,
		},
		survivalDc: {
			aliases: ['survivaltotaldc'],
			baseKey: SheetStatKeys.survival,
			subKey: StatSubGroupEnum.dc,
		},
		survivalProficiency: {
			aliases: ['survivalprof'],
			baseKey: SheetStatKeys.survival,
			subKey: StatSubGroupEnum.proficiency,
		},
		survivalAbility: {
			aliases: [],
			baseKey: SheetStatKeys.survival,
			subKey: StatSubGroupEnum.ability,
		},
		thieveryBonus: {
			aliases: ['thievery', 'thieverytotal', 'thieveryattack', 'thieveryatk'],
			baseKey: SheetStatKeys.thievery,
			subKey: StatSubGroupEnum.bonus,
		},
		thieveryDc: {
			aliases: ['thieverytotaldc'],
			baseKey: SheetStatKeys.thievery,
			subKey: StatSubGroupEnum.dc,
		},
		thieveryProficiency: {
			aliases: ['thieveryprof'],
			baseKey: SheetStatKeys.thievery,
			subKey: StatSubGroupEnum.proficiency,
		},
		thieveryAbility: {
			aliases: [],
			baseKey: SheetStatKeys.thievery,
			subKey: StatSubGroupEnum.ability,
		},
	};

	public static get _aliases(): {
		[k: string]: undefined | keyof typeof SheetStatProperties.properties;
	} {
		const aliases: { [k: string]: undefined | keyof typeof SheetStatProperties.properties } =
			{};
		for (const [key, value] of Object.entries(SheetStatProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as keyof typeof SheetStatProperties.properties;
			}
			aliases[standardizePropKey(key)] = key as keyof typeof SheetStatProperties.properties;
		}
		return aliases;
	}
	public static aliases = SheetStatProperties._aliases;
}

export class SheetAttackProperties {
	constructor(protected sheetAttacks: Sheet['attacks']) {}
	public static propertyNameRegex = /(.+) attack$/i;
}

export class SheetAdditionalSkillProperties {
	constructor(protected sheetInfo: Sheet['additionalSkills']) {}
	public static propertyNameRegex =
		/(.+\W*lore)\W*(dc|bonus|total|attack|proficiency|prof|ability)?$/i;
}

export class SheetWeaknessResistanceProperties {
	constructor(protected sheetInfo: SheetWeaknessesResistances['resistances']) {}
	public static isWeakness = (property: string) => property.toLowerCase().includes('weak');
	public static propertyNameRegex = /(.+) (?:(?:resist(?:ance)?)|(?:weak(?:nesse?)?))(?:s)?/i;
}

export class SheetProperties {
	public static standardizePropKey = standardizePropKey;
	public static standardizeCustomPropName = standardizeCustomPropName;

	public static aliases = {
		...SheetInfoProperties.aliases,
		...SheetInfoListProperties.aliases,
		...SheetIntegerProperties.aliases,
		...SheetBaseCounterProperties.aliases,
		...SheetStatProperties.aliases,
	};
	public static regexes = [
		SheetAttackProperties.propertyNameRegex,
		SheetAdditionalSkillProperties.propertyNameRegex,
		SheetWeaknessResistanceProperties.propertyNameRegex,
	];

	public static properties = {
		...SheetInfoProperties.properties,
		...SheetInfoListProperties.properties,
		...SheetIntegerProperties.properties,
		...SheetBaseCounterProperties.properties,
		...SheetStatProperties.properties,
	};
	public static adjustableAliases = _.omit(this.aliases, ['name', 'level', 'usesstamina']) as {
		[k: string]: string | undefined;
	};
	public static adjustableProperties = _.omit(this.properties, [
		'name',
		'level',
		'usesStamina',
	]) as { [k: string]: string | undefined };

	public static get defaultSheet(): Sheet {
		return getDefaultSheet();
	}

	public static shorthandFromAbility: { [k in AbilityEnum]: string } = {
		[AbilityEnum.strength]: 'str',
		[AbilityEnum.dexterity]: 'dex',
		[AbilityEnum.constitution]: 'con',
		[AbilityEnum.intelligence]: 'int',
		[AbilityEnum.wisdom]: 'wis',
		[AbilityEnum.charisma]: 'cha',
	};

	public static abilityFromAlias: { [k: string]: AbilityEnum } = {
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

	public static groupFromAlias: { [k: string]: StatGroupEnum } = {
		cast: StatGroupEnum.casting,
		classes: StatGroupEnum.class,
		check: StatGroupEnum.checks,
		save: StatGroupEnum.saves,
		skill: StatGroupEnum.skills,
		[StatGroupEnum.casting]: StatGroupEnum.casting,
		[StatGroupEnum.class]: StatGroupEnum.class,
		[StatGroupEnum.checks]: StatGroupEnum.checks,
		[StatGroupEnum.saves]: StatGroupEnum.saves,
		[StatGroupEnum.skills]: StatGroupEnum.skills,
	};

	public static subgroupFromAlias: { [k: string]: StatSubGroupEnum } = {
		abilities: StatSubGroupEnum.ability,
		bonuses: StatSubGroupEnum.bonus,
		dcs: StatSubGroupEnum.dc,
		proficiencies: StatSubGroupEnum.proficiency,
		[StatSubGroupEnum.ability]: StatSubGroupEnum.ability,
		[StatSubGroupEnum.bonus]: StatSubGroupEnum.bonus,
		[StatSubGroupEnum.dc]: StatSubGroupEnum.dc,
		[StatSubGroupEnum.proficiency]: StatSubGroupEnum.proficiency,
	};

	// Sheet property groups are ease of use properties that reference a cluster
	// of other properties based on an optional ability, and then a group.

	public static isPropertyGroup(property: string): boolean {
		let [...keys] = _.kebabCase(property).trim().toLowerCase().split('-');

		let ability: AbilityEnum | undefined,
			group: StatGroupEnum | undefined,
			subGroup: StatSubGroupEnum | undefined;

		for (const key of keys) {
			if (this.abilityFromAlias[key]) {
				ability = this.abilityFromAlias[key];
			} else if (this.groupFromAlias[key]) {
				group = this.groupFromAlias[key];
			} else if (this.subgroupFromAlias[key]) {
				subGroup = this.subgroupFromAlias[key];
			}
		}

		// we have to have a group, but ability and subgroup are optional
		// however, all keys have to match exactly 1 group, ability, or subgroup
		return !!group && [ability, group, subGroup].filter(_.identity).length === keys.length;
	}
	public static propertyGroupToSheetProperties(sheet: Sheet, property: string) {
		let [...keys] = _.kebabCase(property).trim().toLowerCase().split('-');

		let ability: AbilityEnum | undefined,
			group: StatGroupEnum | undefined,
			subGroup: StatSubGroupEnum | undefined;

		for (const key of keys) {
			if (this.abilityFromAlias[key]) {
				ability = this.abilityFromAlias[key];
			} else if (this.groupFromAlias[key]) {
				group = this.groupFromAlias[key];
			} else if (this.subgroupFromAlias[key]) {
				subGroup = this.subgroupFromAlias[key];
			}
		}

		// return an empty array if it's invalid
		if (!group || [ability, group, subGroup].filter(_.identity).length !== keys.length) {
			return [];
		}

		// start with everything, and remove any non-matches
		let allStats = literalKeys(sheet.stats);
		let targetProperties = [StatSubGroupEnum.bonus, StatSubGroupEnum.dc];

		let extraSkills = group === StatGroupEnum.skills ? sheet.additionalSkills : [];

		if (ability) {
			allStats = allStats.filter(stat => sheet.stats[stat].ability === ability);
			extraSkills = extraSkills.filter(skill => skill.ability === ability);
		}

		if (subGroup) {
			targetProperties = [subGroup];
		}

		let targetGroups = [group];
		if (group === StatGroupEnum.checks) {
			targetGroups.push(
				StatGroupEnum.casting,
				StatGroupEnum.class,
				StatGroupEnum.skills,
				StatGroupEnum.saves
			);
		}

		allStats = allStats.filter(stat =>
			targetGroups.some(group => SheetStatProperties.statGroups[group].includes(stat))
		);

		// now we have all the stats that match our criteria, so we can build the properties
		const finalProperties: string[] = [];
		for (const stat of allStats) {
			for (const property of targetProperties) {
				finalProperties.push(`${stat}${_.capitalize(property)}`);
			}
		}
		for (const stat of extraSkills) {
			for (const property of targetProperties) {
				finalProperties.push(`${stat.name}${_.capitalize(property)}`);
			}
		}

		return finalProperties;
	}
}
