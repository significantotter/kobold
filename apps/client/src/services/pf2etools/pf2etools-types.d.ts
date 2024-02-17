export type spellcastingMap = {
	'0'?: SpellLevel;
	'1'?: SpellLevel;
	'2'?: SpellLevel;
	'3'?: SpellLevel;
	'4'?: SpellLevel;
	'5'?: SpellLevel;
	'6'?: SpellLevel;
	'7'?: SpellLevel;
	'8'?: SpellLevel;
	'9'?: SpellLevel;
	'10'?: SpellLevel;
};

export interface ListEntry {
	type: 'list';
	items: Entry[];
}

export interface SuccessDegreeEntry {
	type: 'successDegree';
	entries: {
		'Critical Success': string;
		Success: string;
		Failure: string;
		'Critical Failure': string;
	};
}

export interface DataEntry {
	type: 'data';
	tag: string;
	name: string;
	source: string;
}

export interface Ability {
	activity?: {
		number: number;
		unit: string;
	};
	name: string;
	generic?: {
		tag: string;
	};
	trigger?: string;
	frequency?: {
		unit: string;
		number: number;
	};
	entries?: Entry[];
	traits?: string[];
}

export interface Affliction {
	type: 'affliction';
	name?: string;
	onset?: string;
	notes?: string[];
	traits?: string[];
	DC: number | string;
	savingThrow: string;
	stages?: {
		stage: number;
		entry: Entry;
		duration: string;
	}[];
	entries?: Entry[];
}

export interface Item {
	type: 'item';
	name: 'Armor of Insight ({@skill Perception})';
	entries: Entry[];
}

export interface Pf2Options {
	type: 'pf2-options';
	items: Item[];
}

export interface Pf2Sidebar {
	type: 'pf2-sidebar';
	name: string;
	source: string;
	page: number;
	entries: FluffEntry[];
}

export interface Pf2H2 {
	type: 'pf2-h2';
	name: string;
	collapsible: boolean;
	source: string;
	page: number;
	entries: FluffEntry[];
}

export interface Pf2H3 {
	type: 'pf2-h3';
	name: string;
	entries: FluffEntry[];
}

export type Entry =
	| string
	| ListEntry
	| DataEntry
	| Pf2Options
	| SuccessDegreeEntry
	| Ability
	| Affliction;
export type FluffEntry = Pf2Sidebar | Pf2H2 | Pf2H3 | ListEntry | DataEntry | string;

export interface BestiaryEntry {
	_meta: {
		dependencies: {
			creature: string[];
		};
		internalCopies: string[];
	};
	creature: CreatureStatBlock[];
}

export interface CreatureStatBlock {
	name: string;
	description?: string;
	source?: string;
	page?: number;
	level?: number;
	hasImages?: boolean;
	traits?: string[];
	perception?: Stat;
	_copy?: any;
	senses?: {
		name: string;
		type?: string;
		range?: number;
	}[];
	skills?: {
		[key: string]: Stat;
	};
	abilityMods?: {
		str: number;
		dex: number;
		con: number;
		int: number;
		wis: number;
		cha: number;
	};
	speed?: {
		abilities: string[];
		walk?: number;
		climb?: number;
		fly?: number;
		swim?: number;
	};
	attacks?: {
		range: string;
		name: string;
		attack: number;
		effects?: string[];
		damage: string;
		types: string[];
		traits?: string[];
	}[];
	rituals?: Ritual[];
	abilities?: {
		top?: (Ability | Affliction)[];
		mid?: (Ability | Affliction)[];
		bot?: (Ability | Affliction)[];
	};
	defenses?: {
		ac: Stat;
		savingThrows: {
			fort: Stat;
			ref: Stat;
			will: Stat;
			abilities?: string[];
		};
		hp: {
			hp: number;
			abilities?: string[];
			note?: string;
		}[];
		immunities: string[];
		resistances?: {
			amount: number;
			name: string;
			note?: string;
		}[];
		weaknesses?: {
			amount: number;
			name: string;
			note?: string;
		}[];
	};
	languages?: {
		languages: string[];
		notes?: string[];
	};
	items?: string[];
	spellcasting?: {
		type: string;
		tradition: string;
		DC: number;
		fp?: number;
		attack?: number;
		entry: {
			constant?: spellcastingMap;
		} & spellcastingMap;
	}[];
}

export interface CreatureFluff {
	name: string;
	source: string;
	entries: FluffEntry[];
	images: string[];
	_copy?: any;
}

export interface Stat {
	std: number;
	note?: string;
	[key: string]: any;
}
export interface SpellLevel {
	level: number;
	slots?: number;
	spells: {
		name: string;
		amount?: string | number;
		source?: string;
		notes?: string[];
	}[];
}

export interface Ritual {
	tradition: string;
	DC: number | string;
	rituals: {
		name: string;
		level?: number;
		amount?: string | number;
		source?: string;
		notes?: string[];
	};
}

export interface ActionFooter {
	name: string;
	entries: Entry[];
}

export interface Action {
	name: string;
	source: string;
	activity?: {
		number: number;
		unit: string;
	};
	page?: number;
	traits: string[];
	frequency?: {
		number: number;
		unit: string;
	};
	actionType?: {
		class?: string[];
		archetype?: string[];
	};
	trigger: string;
	requirements?: string;
	entries?: Entry[];
	special?: string[];
	footer?: ActionFooter[];
}
