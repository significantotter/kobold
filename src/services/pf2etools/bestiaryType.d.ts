type spellLevelKeys = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10';

interface Stat {
	std: number;
	note?: string;
	[key: string]: any;
}
interface SpellLevel {
	level: number;
	slots?: number;
	spells: {
		name: string;
		amount?: string | number;
		source?: string;
		notes?: string[];
	}[];
}

interface Ritual {
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

interface ListEntry {
	type: 'list';
	items: Entry[];
}

interface SuccessDegreeEntry {
	type: 'successDegree';
	entries: {
		'Critical Success': string;
		Success: string;
		Failure: string;
		'Critical Failure': string;
	};
}

interface DataEntry {
	type: 'data';
	tag: string;
	name: string;
	source: string;
}

type Entry = string | ListEntry | DataEntry | SuccessDegreeEntry | Ability | Affliction;

interface Ability {
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

interface Affliction {
	type: 'affliction';
	name: string;
	onset?: string;
	notes?: string[];
	traits?: string[];
	DC: number | string;
	savingThrow: string;
	stages: {
		stage: number;
		entry: Entry;
		duration: string;
	}[];
}
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
			constant?: {
				[k: spellLevelKeys]: SpellLevel;
			};
			[k: spellLevelKeys]: SpellLevel;
		};
	}[];
}

type fluffEntry = Pf2Sidebar | Pf2H2 | ListEntry | DataEntry | string;

interface Pf2Sidebar {
	type: 'pf2-sidebar';
	name: string;
	source: string;
	page: number;
	entries: fluffEntry[];
}

interface Pf2H2 {
	type: 'pf2-h2';
	name: string;
	collapsible: boolean;
	source: string;
	page: number;
	entries: fluffEntry[];
}

interface Pf2H2 {
	type: 'pf2-h3';
	name: string;
	entries: fluffEntry[];
}

export interface CreatureFluff {
	name: string;
	source: string;
	entries: fluffEntry[];
	images: string[];
	_copy?: any;
}
