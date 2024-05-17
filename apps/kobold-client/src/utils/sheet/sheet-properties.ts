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
} from '@kobold/db';
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

	public static properties: Record<
		SheetIntegerKeys,
		{ aliases: string[]; type: string; tags: string[] }
	> = {
		ac: { aliases: ['armor', 'armorclass'], type: 'ac', tags: [] },
		// Ability Scores
		strength: { aliases: ['str'], type: 'attr', tags: ['strength'] },
		dexterity: { aliases: ['dex'], type: 'attr', tags: ['dexterity'] },
		constitution: { aliases: ['con'], type: 'attr', tags: ['constitution'] },
		intelligence: { aliases: ['int'], type: 'attr', tags: ['intelligence'] },
		wisdom: { aliases: ['wis'], type: 'attr', tags: ['wisdom'] },
		charisma: { aliases: ['cha'], type: 'attr', tags: ['charisma'] },
		// Speeds
		walkSpeed: { aliases: ['walk', 'speed'], type: 'speed', tags: [] },
		flySpeed: { aliases: ['fly'], type: 'speed', tags: [] },
		swimSpeed: { aliases: ['swim'], type: 'speed', tags: [] },
		climbSpeed: { aliases: ['climb'], type: 'speed', tags: [] },
		burrowSpeed: { aliases: ['burrow'], type: 'speed', tags: [] },
		dimensionalSpeed: {
			aliases: ['dimensional'],
			type: 'speed',
			tags: [],
		},
		// Extra Proficiencies
		heavyProficiency: { aliases: ['heavy'], type: 'proficiency', tags: [] },
		mediumProficiency: { aliases: ['medium'], type: 'proficiency', tags: [] },
		lightProficiency: { aliases: ['light'], type: 'proficiency', tags: [] },
		unarmoredProficiency: { aliases: ['unarmored'], type: 'proficiency', tags: [] },
		martialProficiency: { aliases: ['martial'], type: 'proficiency', tags: [] },
		simpleProficiency: { aliases: ['simple'], type: 'proficiency', tags: [] },
		unarmedProficiency: { aliases: ['unarmed'], type: 'proficiency', tags: [] },
		advancedProficiency: { aliases: ['advanced'], type: 'proficiency', tags: [] },
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
	public static properties: Record<
		SheetBaseCounterKeys,
		{ aliases: string[]; type: string; tags: [] }
	> = {
		heroPoints: { aliases: ['maxheropoints'], type: 'resource', tags: [] },
		focusPoints: { aliases: ['fp', 'maxfp', 'maxfocuspoints'], type: 'resource', tags: [] },
		hp: {
			aliases: ['health', 'hitpoints', 'maxhp', 'maxhealth', 'maxhitpoints'],
			type: 'health',
			tags: [],
		},
		tempHp: { aliases: ['temphealth', 'temphitpoints'], type: 'health', tags: [] },
		stamina: { aliases: ['stam', 'maxstam', 'maxstamina'], type: 'health', tags: [] },
		resolve: { aliases: ['maxresolve'], type: 'health', tags: [] },
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

export type SheetStatPropertyKey = `${SheetStatKeys}${Capitalize<StatSubGroupEnum>}`;

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

	public static isSheetStatPropertyName(name: string): name is SheetStatPropertyKey {
		return (this.properties as Record<string, any>)[name] !== undefined;
	}

	public static properties: Record<
		SheetStatPropertyKey,
		{
			aliases: string[];
			baseKey: SheetStatKeys;
			subKey: StatSubGroupEnum;
			type: string;
			tags: string[];
		}
	> = {
		// casting
		arcaneBonus: {
			aliases: ['castingarcane', 'arcane', 'arcanetotal', 'arcaneattack', 'arcaneatk'],
			baseKey: SheetStatKeys.arcane,
			subKey: StatSubGroupEnum.bonus,
			type: 'spellcasting',
			tags: [],
		},
		arcaneDc: {
			aliases: ['arcanetotaldc'],
			baseKey: SheetStatKeys.arcane,
			subKey: StatSubGroupEnum.dc,
			type: 'spellcasting',
			tags: [],
		},
		arcaneProficiency: {
			aliases: ['arcaneprof'],
			baseKey: SheetStatKeys.arcane,
			subKey: StatSubGroupEnum.proficiency,
			type: 'spellcasting',
			tags: [],
		},
		arcaneAbility: {
			aliases: [],
			baseKey: SheetStatKeys.arcane,
			subKey: StatSubGroupEnum.ability,
			type: 'spellcasting',
			tags: [],
		},
		divineBonus: {
			aliases: ['castingdivine', 'divine', 'divinetotal', 'divineattack', 'divineatk'],
			baseKey: SheetStatKeys.divine,
			subKey: StatSubGroupEnum.bonus,
			type: 'spellcasting',
			tags: [],
		},
		divineDc: {
			aliases: ['divinetotaldc'],
			baseKey: SheetStatKeys.divine,
			subKey: StatSubGroupEnum.dc,
			type: 'spellcasting',
			tags: [],
		},
		divineProficiency: {
			aliases: ['divineprof'],
			baseKey: SheetStatKeys.divine,
			subKey: StatSubGroupEnum.proficiency,
			type: 'spellcasting',
			tags: [],
		},
		divineAbility: {
			aliases: [],
			baseKey: SheetStatKeys.divine,
			subKey: StatSubGroupEnum.ability,
			type: 'spellcasting',
			tags: [],
		},
		occultBonus: {
			aliases: ['castingoccult', 'occult', 'occulttotal', 'occultattack', 'occultatk'],
			baseKey: SheetStatKeys.occult,
			subKey: StatSubGroupEnum.bonus,
			type: 'spellcasting',
			tags: [],
		},
		occultDc: {
			aliases: ['occulttotaldc'],
			baseKey: SheetStatKeys.occult,
			subKey: StatSubGroupEnum.dc,
			type: 'spellcasting',
			tags: [],
		},
		occultProficiency: {
			aliases: ['occultprof'],
			baseKey: SheetStatKeys.occult,
			subKey: StatSubGroupEnum.proficiency,
			type: 'spellcasting',
			tags: [],
		},
		occultAbility: {
			aliases: [],
			baseKey: SheetStatKeys.occult,
			subKey: StatSubGroupEnum.ability,
			type: 'spellcasting',
			tags: [],
		},
		primalBonus: {
			aliases: ['castingprimal', 'primal', 'primaltotal', 'primalattack', 'primalatk'],
			baseKey: SheetStatKeys.primal,
			subKey: StatSubGroupEnum.bonus,
			type: 'spellcasting',
			tags: [],
		},
		primalDc: {
			aliases: ['primaltotaldc'],
			baseKey: SheetStatKeys.primal,
			subKey: StatSubGroupEnum.dc,
			type: 'spellcasting',
			tags: [],
		},
		primalProficiency: {
			aliases: ['primalprof'],
			baseKey: SheetStatKeys.primal,
			subKey: StatSubGroupEnum.proficiency,
			type: 'spellcasting',
			tags: [],
		},
		primalAbility: {
			aliases: [],
			baseKey: SheetStatKeys.primal,
			subKey: StatSubGroupEnum.ability,
			type: 'spellcasting',
			tags: [],
		},
		// Class attack/Dc
		classBonus: {
			aliases: ['class', 'classtotal', 'classattack', 'classatk'],
			baseKey: SheetStatKeys.class,
			subKey: StatSubGroupEnum.bonus,
			type: 'class',
			tags: [],
		},
		classDc: {
			aliases: ['classtotaldc'],
			baseKey: SheetStatKeys.class,
			subKey: StatSubGroupEnum.dc,
			type: 'class',
			tags: [],
		},
		classProficiency: {
			aliases: ['classprof'],
			baseKey: SheetStatKeys.class,
			subKey: StatSubGroupEnum.proficiency,
			type: 'class',
			tags: [],
		},
		classAbility: {
			aliases: [],
			baseKey: SheetStatKeys.class,
			subKey: StatSubGroupEnum.ability,
			type: 'class',
			tags: [],
		},
		// perception
		perceptionBonus: {
			aliases: ['perc', 'perception', 'perceptiontotal', 'perceptionattack', 'perceptionatk'],
			baseKey: SheetStatKeys.perception,
			subKey: StatSubGroupEnum.bonus,
			type: 'perception',
			tags: ['check', 'perception'],
		},
		perceptionDc: {
			aliases: ['perceptiontotaldc', 'perctotaldc', 'percdc'],
			baseKey: SheetStatKeys.perception,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['check', 'perception'],
		},
		perceptionProficiency: {
			aliases: ['perceptionprof', 'percproficiency', 'percprof'],
			baseKey: SheetStatKeys.perception,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['check', 'perception'],
		},
		perceptionAbility: {
			aliases: ['percability'],
			baseKey: SheetStatKeys.perception,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['check', 'perception'],
		},
		// saves
		fortitudeBonus: {
			aliases: [
				'fortitude',
				'fortitudetotal',
				'fortitudebonus',
				'fortitudeattack',
				'fortitudeatk',
				'fort',
				'forttotal',
				'fortbonus',
				'fortattack',
				'fortatk',
			],
			baseKey: SheetStatKeys.fortitude,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['fortitude', 'constitution'],
		},
		fortitudeDc: {
			aliases: ['fortitudetotaldc', 'forttotaldc', 'fortdc'],
			baseKey: SheetStatKeys.fortitude,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['fortitude', 'constitution'],
		},
		fortitudeProficiency: {
			aliases: ['fortitudeprof', 'fortproficiency', 'fortprof'],
			baseKey: SheetStatKeys.fortitude,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['fortitude', 'constitution'],
		},
		fortitudeAbility: {
			aliases: ['fortability'],
			baseKey: SheetStatKeys.fortitude,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['fortitude', 'constitution'],
		},
		reflexBonus: {
			aliases: [
				'reflex',
				'reflextotal',
				'reflexbonus',
				'reflexattack',
				'reflexatk',
				'ref',
				'reftotal',
				'refbonus',
				'refattack',
				'refatk',
			],
			baseKey: SheetStatKeys.reflex,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['reflex', 'dexterity'],
		},
		reflexDc: {
			aliases: ['reflextotaldc', 'reftotaldc', 'refdc'],
			baseKey: SheetStatKeys.reflex,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['reflex', 'dexterity'],
		},
		reflexProficiency: {
			aliases: ['reflexprof', 'reflexproficiency', 'refprof'],
			baseKey: SheetStatKeys.reflex,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['reflex', 'dexterity'],
		},
		reflexAbility: {
			aliases: ['refability'],
			baseKey: SheetStatKeys.reflex,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['reflex', 'dexterity'],
		},
		willBonus: {
			aliases: ['will', 'willtotal', 'willattack', 'willatk'],
			baseKey: SheetStatKeys.will,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['will', 'wisdom'],
		},
		willDc: {
			aliases: ['willtotaldc'],
			baseKey: SheetStatKeys.will,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['will', 'wisdom'],
		},
		willProficiency: {
			aliases: ['willprof'],
			baseKey: SheetStatKeys.will,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['will', 'wisdom'],
		},
		willAbility: {
			aliases: [],
			baseKey: SheetStatKeys.will,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['will', 'wisdom'],
		},
		// skills
		acrobaticsBonus: {
			aliases: ['acrobatics', 'acrobaticstotal', 'acrobaticsattack', 'acrobaticsatk'],
			baseKey: SheetStatKeys.acrobatics,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'reflex', 'acrobatics'],
		},
		acrobaticsDc: {
			aliases: ['acrobaticstotaldc'],
			baseKey: SheetStatKeys.acrobatics,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'reflex', 'acrobatics'],
		},
		acrobaticsProficiency: {
			aliases: ['acrobaticsprof'],
			baseKey: SheetStatKeys.acrobatics,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'reflex', 'acrobatics'],
		},
		acrobaticsAbility: {
			aliases: [],
			baseKey: SheetStatKeys.acrobatics,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'reflex', 'acrobatics'],
		},
		arcanaBonus: {
			aliases: ['arcana', 'arcanatotal', 'arcanaattack', 'arcanaatk'],
			baseKey: SheetStatKeys.arcana,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'intelligence', 'arcana'],
		},
		arcanaDc: {
			aliases: ['arcanatotaldc'],
			baseKey: SheetStatKeys.arcana,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'intelligence', 'arcana'],
		},
		arcanaProficiency: {
			aliases: ['arcanaprof'],
			baseKey: SheetStatKeys.arcana,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'intelligence', 'arcana'],
		},
		arcanaAbility: {
			aliases: [],
			baseKey: SheetStatKeys.arcana,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'intelligence', 'arcana'],
		},
		athleticsBonus: {
			aliases: ['athletics', 'athleticstotal', 'athleticsattack', 'athleticsatk'],
			baseKey: SheetStatKeys.athletics,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'strength', 'athletics'],
		},
		athleticsDc: {
			aliases: ['athleticstotaldc'],
			baseKey: SheetStatKeys.athletics,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'strength', 'athletics'],
		},
		athleticsProficiency: {
			aliases: ['athleticsprof'],
			baseKey: SheetStatKeys.athletics,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'strength', 'athletics'],
		},
		athleticsAbility: {
			aliases: [],
			baseKey: SheetStatKeys.athletics,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'strength', 'athletics'],
		},
		craftingBonus: {
			aliases: ['crafting', 'craftingtotal', 'craftingattack', 'craftingatk'],
			baseKey: SheetStatKeys.crafting,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'intelligence', 'crafting'],
		},
		craftingDc: {
			aliases: ['craftingtotaldc'],
			baseKey: SheetStatKeys.crafting,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'intelligence', 'crafting'],
		},
		craftingProficiency: {
			aliases: ['craftingprof'],
			baseKey: SheetStatKeys.crafting,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'intelligence', 'crafting'],
		},
		craftingAbility: {
			aliases: [],
			baseKey: SheetStatKeys.crafting,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'intelligence', 'crafting'],
		},
		deceptionBonus: {
			aliases: ['deception', 'deceptiontotal', 'deceptionattack', 'deceptionatk'],
			baseKey: SheetStatKeys.deception,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'charisma', 'deception'],
		},
		deceptionDc: {
			aliases: ['deceptiontotaldc'],
			baseKey: SheetStatKeys.deception,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'charisma', 'deception'],
		},
		deceptionProficiency: {
			aliases: ['deceptionprof'],
			baseKey: SheetStatKeys.deception,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'charisma', 'deception'],
		},
		deceptionAbility: {
			aliases: [],
			baseKey: SheetStatKeys.deception,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'charisma', 'deception'],
		},
		diplomacyBonus: {
			aliases: ['diplomacy', 'diplomacytotal', 'diplomacyattack', 'diplomacyatk'],
			baseKey: SheetStatKeys.diplomacy,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'charisma', 'diplomacy'],
		},
		diplomacyDc: {
			aliases: ['diplomacytotaldc'],
			baseKey: SheetStatKeys.diplomacy,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'charisma', 'diplomacy'],
		},
		diplomacyProficiency: {
			aliases: ['diplomacyprof'],
			baseKey: SheetStatKeys.diplomacy,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'charisma', 'diplomacy'],
		},
		diplomacyAbility: {
			aliases: [],
			baseKey: SheetStatKeys.diplomacy,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'charisma', 'diplomacy'],
		},
		intimidationBonus: {
			aliases: ['intimidation', 'intimidationtotal', 'intimidationattack', 'intimidationatk'],
			baseKey: SheetStatKeys.intimidation,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'charisma', 'intimidation'],
		},
		intimidationDc: {
			aliases: ['intimidationtotaldc'],
			baseKey: SheetStatKeys.intimidation,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'charisma', 'intimidation'],
		},
		intimidationProficiency: {
			aliases: ['intimidationprof'],
			baseKey: SheetStatKeys.intimidation,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'charisma', 'intimidation'],
		},
		intimidationAbility: {
			aliases: [],
			baseKey: SheetStatKeys.intimidation,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'charisma', 'intimidation'],
		},
		medicineBonus: {
			aliases: ['medicine', 'medicinetotal', 'medicineattack', 'medicineatk'],
			baseKey: SheetStatKeys.medicine,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'wisdom', 'medicine'],
		},
		medicineDc: {
			aliases: ['medicinetotaldc'],
			baseKey: SheetStatKeys.medicine,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'wisdom', 'medicine'],
		},
		medicineProficiency: {
			aliases: ['medicineprof'],
			baseKey: SheetStatKeys.medicine,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'wisdom', 'medicine'],
		},
		medicineAbility: {
			aliases: [],
			baseKey: SheetStatKeys.medicine,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'wisdom', 'medicine'],
		},
		natureBonus: {
			aliases: ['nature', 'naturetotal', 'natureattack', 'natureatk'],
			baseKey: SheetStatKeys.nature,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'wisdom', 'nature'],
		},
		natureDc: {
			aliases: ['naturetotaldc'],
			baseKey: SheetStatKeys.nature,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'wisdom', 'nature'],
		},
		natureProficiency: {
			aliases: ['natureprof'],
			baseKey: SheetStatKeys.nature,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'wisdom', 'nature'],
		},
		natureAbility: {
			aliases: [],
			baseKey: SheetStatKeys.nature,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'wisdom', 'nature'],
		},
		occultismBonus: {
			aliases: ['occultism', 'occultismtotal', 'occultismattack', 'occultismatk'],
			baseKey: SheetStatKeys.occultism,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'intelligence', 'occultism'],
		},
		occultismDc: {
			aliases: ['occultismtotaldc'],
			baseKey: SheetStatKeys.occultism,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'intelligence', 'occultism'],
		},
		occultismProficiency: {
			aliases: ['occultismprof'],
			baseKey: SheetStatKeys.occultism,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'intelligence', 'occultism'],
		},
		occultismAbility: {
			aliases: [],
			baseKey: SheetStatKeys.occultism,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'intelligence', 'occultism'],
		},
		performanceBonus: {
			aliases: ['performance', 'performancetotal', 'performanceattack', 'performanceatk'],
			baseKey: SheetStatKeys.performance,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'charisma', 'performance'],
		},
		performanceDc: {
			aliases: ['performancetotaldc'],
			baseKey: SheetStatKeys.performance,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'charisma', 'performance'],
		},
		performanceProficiency: {
			aliases: ['performanceprof'],
			baseKey: SheetStatKeys.performance,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'charisma', 'performance'],
		},
		performanceAbility: {
			aliases: [],
			baseKey: SheetStatKeys.performance,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'charisma', 'performance'],
		},
		religionBonus: {
			aliases: ['religion', 'religiontotal', 'religionattack', 'religionatk'],
			baseKey: SheetStatKeys.religion,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'wisdom', 'religion'],
		},
		religionDc: {
			aliases: ['religiontotaldc'],
			baseKey: SheetStatKeys.religion,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'wisdom', 'religion'],
		},
		religionProficiency: {
			aliases: ['religionprof'],
			baseKey: SheetStatKeys.religion,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'wisdom', 'religion'],
		},
		religionAbility: {
			aliases: [],
			baseKey: SheetStatKeys.religion,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'wisdom', 'religion'],
		},
		societyBonus: {
			aliases: ['society', 'societytotal', 'societyattack', 'societyatk'],
			baseKey: SheetStatKeys.society,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'intelligence', 'society'],
		},
		societyDc: {
			aliases: ['societytotaldc'],
			baseKey: SheetStatKeys.society,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'intelligence', 'society'],
		},
		societyProficiency: {
			aliases: ['societyprof'],
			baseKey: SheetStatKeys.society,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'intelligence', 'society'],
		},
		societyAbility: {
			aliases: [],
			baseKey: SheetStatKeys.society,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'intelligence', 'society'],
		},
		stealthBonus: {
			aliases: ['stealth', 'stealthtotal', 'stealthattack', 'stealthatk'],
			baseKey: SheetStatKeys.stealth,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'dexterity', 'stealth'],
		},
		stealthDc: {
			aliases: ['stealthtotaldc'],
			baseKey: SheetStatKeys.stealth,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'dexterity', 'stealth'],
		},
		stealthProficiency: {
			aliases: ['stealthprof'],
			baseKey: SheetStatKeys.stealth,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'dexterity', 'stealth'],
		},
		stealthAbility: {
			aliases: [],
			baseKey: SheetStatKeys.stealth,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'dexterity', 'stealth'],
		},
		survivalBonus: {
			aliases: ['survival', 'survivaltotal', 'survivalattack', 'survivalatk'],
			baseKey: SheetStatKeys.survival,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'wisdom', 'survival'],
		},
		survivalDc: {
			aliases: ['survivaltotaldc'],
			baseKey: SheetStatKeys.survival,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'wisdom', 'survival'],
		},
		survivalProficiency: {
			aliases: ['survivalprof'],
			baseKey: SheetStatKeys.survival,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'wisdom', 'survival'],
		},
		survivalAbility: {
			aliases: [],
			baseKey: SheetStatKeys.survival,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'wisdom', 'survival'],
		},
		thieveryBonus: {
			aliases: ['thievery', 'thieverytotal', 'thieveryattack', 'thieveryatk'],
			baseKey: SheetStatKeys.thievery,
			subKey: StatSubGroupEnum.bonus,
			type: '',
			tags: ['skill', 'dexterity', 'thievery'],
		},
		thieveryDc: {
			aliases: ['thieverytotaldc'],
			baseKey: SheetStatKeys.thievery,
			subKey: StatSubGroupEnum.dc,
			type: '',
			tags: ['skill', 'dexterity', 'thievery'],
		},
		thieveryProficiency: {
			aliases: ['thieveryprof'],
			baseKey: SheetStatKeys.thievery,
			subKey: StatSubGroupEnum.proficiency,
			type: '',
			tags: ['skill', 'dexterity', 'thievery'],
		},
		thieveryAbility: {
			aliases: [],
			baseKey: SheetStatKeys.thievery,
			subKey: StatSubGroupEnum.ability,
			type: '',
			tags: ['skill', 'dexterity', 'thievery'],
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

	public static standardizeProperty(propertyName: string) {
		const lowerTrimmedProperty = propertyName.toLowerCase().trim().replaceAll(/_|-/g, '');
		const withoutSpaces = lowerTrimmedProperty.replaceAll(' ', '');

		// if any alias matches without spaces, then its valid
		const sheetProperty = SheetProperties.adjustableAliases[withoutSpaces];
		if (sheetProperty) {
			return sheetProperty;
		}

		// if any property regex matches, then its valid
		if (_.some(SheetProperties.regexes, regex => regex.test(propertyName))) return propertyName;
		if (_.some(SheetProperties.regexes, regex => regex.test(lowerTrimmedProperty)))
			return lowerTrimmedProperty;

		// we're not validating yet, so still return the string
		return propertyName.trim();
	}

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
	public static propertyGroupToSheetProperties(
		property: string,
		sheet: Sheet = SheetProperties.defaultSheet
	) {
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
			targetGroups.some(group =>
				SheetStatProperties.statGroups[group].includes(stat as SheetStatKeys)
			)
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
