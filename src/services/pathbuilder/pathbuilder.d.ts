export type ability = 'str' | 'dex' | 'con' | 'int' | 'wis' | 'cha';
export type spellTradition = 'arcane' | 'divine' | 'occult' | 'primal';

export namespace PathBuilder {
	interface JsonExport {
		success: boolean;
		build: Character;
	}

	interface Character {
		name: string;
		class: string;
		level: number;
		ancestry: string;
		heritage: string;
		background: string;
		alignment: string;
		gender: string;
		age: number;
		deity: string;
		size: number;
		keyability: string;
		languages: string[];

		attributes: Attributes;
		abilities: Abilities;
		proficiencies: Proficiencies;
		feats?: [
			string,
			string | null,
			string | undefined | null,
			number | undefined | null,
			...any
		][];
		specials?: string[];
		lores?: [string?, number?, ...any][];
		equipment?: [string?, number?, ...any][];
		specificProficiencies: SpecificProficiencies;
		weapons: Weapon[];
		money: Money;
		armor: Armor[];
		focus: Focus;
		spellCasters: SpellCasting[];
		formula: [];
		pets: [];
		acTotal: {
			acProfBonus: number;
			acAbilityBonus: number;
			acItemBonus: number;
			acTotal: number;
		};
	}
	interface Attributes {
		ancestryhp: number;
		classhp: number;
		bonushp: number;
		bonushpPerLevel: number;
		speed: number;
		speedBonus: number;
	}
	interface Abilities {
		str: number;
		dex: number;
		con: number;
		int: number;
		wis: number;
		cha: number;
	}
	interface Proficiencies {
		classDC?: number;
		perception?: number;
		fortitude?: number;
		reflex?: number;
		will?: number;
		heavy?: number;
		medium?: number;
		light?: number;
		unarmored?: number;
		advanced?: number;
		martial?: number;
		simple?: number;
		unarmed?: number;
		castingArcane?: number;
		castingDivine?: number;
		castingOccult?: number;
		castingPrimal?: number;
		acrobatics?: number;
		arcana?: number;
		athletics?: number;
		crafting?: number;
		deception?: number;
		diplomacy?: number;
		intimidation?: number;
		medicine?: number;
		nature?: number;
		occultism?: number;
		performance?: number;
		religion?: number;
		society?: number;
		stealth?: number;
		survival?: number;
		thievery?: number;
	}
	interface SpecificProficiencies {
		trained: any[];
		expert: any[];
		master: any[];
		legendary: any[];
	}
	interface Weapon {
		name?: string;
		qty?: number;
		prof?: string;
		die?: string;
		pot?: number;
		str?: string;
		mat?: any;
		display?: string;
		runes?: any[];
	}
	interface Money {
		pp?: number;
		gp?: number;
		sp?: number;
		cp?: number;
	}
	interface Armor {
		name?: string;
		qty?: number;
		prof?: string;
		die?: string;
		pot?: number;
		res?: string;
		mat?: any;
		display?: string;
		worn?: boolean;
		runes?: any[];
	}

	interface FocusCasting {
		abilityBonus: number;
		proficiency: number;
		itemBonus: number;
		focusSpells: string[];
	}

	interface FocusCastingStat {
		str?: FocusCasting;
		dex?: FocusCasting;
		con?: FocusCasting;
		int?: FocusCasting;
		wis?: FocusCasting;
		cha?: FocusCasting;
	}

	interface Focus {
		focusPoints: number;
		arcane?: FocusCastingStat;
		divine?: FocusCastingStat;
		occult?: FocusCastingStat;
		primal?: FocusCastingStat;
	}

	interface SpellsAtLevel {
		spellLevel: number;
		list: string[];
	}

	interface SpellCasting {
		name: string;
		magicTradition: spellTradition;
		spellcastingType: string;
		ability: ability;
		proficiency: number;
		focusPoints: number;
		spells: SpellsAtLevel[];
		perDay: [
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number,
			number
		];
	}

	interface pets {
		type: string;
		name: string;
		specific?: any;
		abilities?: string[];

		animal?: string;
		mature: boolean;
		incredible: boolean;
		incredibleType: string;
		specializations: any[];
		armor: string;
		equipment: [string, number | null, ...any][];
	}

	interface formula {
		type: string;
		known: string[];
	}
}
