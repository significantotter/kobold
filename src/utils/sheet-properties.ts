import _ from 'lodash';
import {
	Sheet,
	SheetBaseCounters,
	SheetInfo,
	SheetInfoLists,
	SheetIntegers,
	SheetStats,
	SheetWeaknessesResistances,
} from '../services/kobold/models/index.js';

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
		keyability: { aliases: [] },
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
			aliases[key.toLowerCase()] = key as keyof SheetInfo;
		}
		return aliases;
	}
	public static aliases = SheetInfoProperties._aliases;
}

export class SheetInfoListProperties {
	constructor(protected sheetInfo: SheetInfoLists) {}
	public static properties: Record<keyof SheetInfoLists, { aliases: string[] }> = {
		traits: { aliases: [] },
		languages: { aliases: [] },
		senses: { aliases: [] },
		immunities: { aliases: ['immune'] },
	};

	public static get _aliases(): { [k: string]: undefined | keyof SheetInfoLists } {
		const aliases: { [k: string]: undefined | keyof SheetInfoLists } = {};
		for (const [key, value] of Object.entries(SheetInfoListProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as keyof SheetInfoLists;
			}
			aliases[key.toLowerCase()] = key as keyof SheetInfoLists;
		}
		return aliases;
	}
	public static aliases = SheetInfoListProperties._aliases;
}

export class SheetIntegerProperties {
	constructor(protected sheetIntegers: SheetIntegers) {}
	public static properties: Record<keyof SheetIntegers, { aliases: string[] }> = {
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

	public static get _aliases(): { [k: string]: undefined | keyof SheetIntegers } {
		const aliases: { [k: string]: undefined | keyof SheetIntegers } = {};
		for (const [key, value] of Object.entries(SheetIntegerProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as keyof SheetIntegers;
			}
			aliases[key.toLowerCase()] = key as keyof SheetIntegers;
		}
		return aliases;
	}
	public static aliases = SheetIntegerProperties._aliases;
}

export class SheetBaseCounterProperties {
	constructor(protected sheetBaseCounters: SheetBaseCounters) {}
	public static properties: Record<keyof SheetBaseCounters, { aliases: string[] }> = {
		heroPoints: { aliases: [] },
		focusPoints: { aliases: [] },
		hp: { aliases: [] },
		tempHp: { aliases: [] },
		stamina: { aliases: [] },
		resolve: { aliases: [] },
	};

	public static get _aliases(): { [k: string]: undefined | keyof SheetBaseCounters } {
		const aliases: { [k: string]: undefined | keyof SheetBaseCounters } = {};
		for (const [key, value] of Object.entries(SheetBaseCounterProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as keyof SheetBaseCounters;
			}
			aliases[key.toLowerCase()] = key as keyof SheetBaseCounters;
		}
		return aliases;
	}
	public static aliases = SheetBaseCounterProperties._aliases;
}

export class SheetStatProperties {
	constructor(protected sheetStats: SheetStats) {}
	public static properties: Record<keyof SheetStats, { aliases: string[] }> = {
		// casting
		arcane: { aliases: [] },
		divine: { aliases: [] },
		occult: { aliases: [] },
		primal: { aliases: [] },
		// Class attack/DC
		class: { aliases: [] },
		// perception
		perception: { aliases: [] },
		// saves
		fortitude: { aliases: [] },
		reflex: { aliases: [] },
		will: { aliases: [] },
		// skills
		acrobatics: { aliases: [] },
		arcana: { aliases: [] },
		athletics: { aliases: [] },
		crafting: { aliases: [] },
		deception: { aliases: [] },
		diplomacy: { aliases: [] },
		intimidation: { aliases: [] },
		medicine: { aliases: [] },
		nature: { aliases: [] },
		occultism: { aliases: [] },
		performance: { aliases: [] },
		religion: { aliases: [] },
		society: { aliases: [] },
		stealth: { aliases: [] },
		survival: { aliases: [] },
		thievery: { aliases: [] },
	};

	public static get _aliases(): { [k: string]: undefined | keyof SheetStats } {
		const aliases: { [k: string]: undefined | keyof SheetStats } = {};
		for (const [key, value] of Object.entries(SheetStatProperties.properties)) {
			for (const alias of value.aliases) {
				aliases[alias] = key as keyof SheetStats;
			}
			aliases[key.toLowerCase()] = key as keyof SheetStats;
		}
		return aliases;
	}
	public static aliases = SheetStatProperties._aliases;
}

export class SheetAttackProperties {
	constructor(protected sheetAttacks: Sheet['attacks']) {}
	public static propertyNameRegex = /(.*) attack$/i;
}

export class SheetAdditionalSkillProperties {
	constructor(protected sheetInfo: Sheet['additionalSkills']) {}
	public static propertyNameRegex = /(.*) lore$/i;
}

export class SheetResistanceProperties {
	constructor(protected sheetInfo: SheetWeaknessesResistances['resistances']) {}
	public static propertyNameRegex = /resistance(s)?/i;
}

export class SheetWeaknessProperties {
	constructor(protected sheetInfo: SheetWeaknessesResistances['weaknesses']) {}
	public static propertyNameRegex = /weakness(es)?/i;
}

export class SheetProperties {
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
		SheetResistanceProperties.propertyNameRegex,
		SheetWeaknessProperties.propertyNameRegex,
	];

	public static properties = SheetInfoProperties.properties;
	public static adjustableAliases = _.omit(SheetInfoProperties.aliases, [
		'name',
		'level',
		'usesStamina',
	]) as { [k: string]: string | undefined };

	public static get defaultSheet(): Sheet {
		return {
			staticInfo: {
				name: '',
				level: null,
				usesStamina: false,
			},
			info: {
				url: null,
				description: null,
				gender: null,
				age: null,
				alignment: null,
				deity: null,
				imageURL: null,
				size: null,
				class: null,
				keyability: null,
				ancestry: null,
				heritage: null,
				background: null,
			},
			infoLists: {
				traits: [],
				senses: [],
				languages: [],
				immunities: [],
			},
			weaknessesResistances: {
				resistances: [],
				weaknesses: [],
			},
			intProperties: {
				ac: null,

				strength: null,
				dexterity: null,
				constitution: null,
				intelligence: null,
				wisdom: null,
				charisma: null,

				walkSpeed: null,
				flySpeed: null,
				swimSpeed: null,
				climbSpeed: null,
				burrowSpeed: null,
				dimensionalSpeed: null,

				heavyProficiency: null,
				mediumProficiency: null,
				lightProficiency: null,
				unarmoredProficiency: null,

				martialProficiency: null,
				simpleProficiency: null,
				unarmedProficiency: null,
				advancedProficiency: null,
			},
			baseCounters: {
				heroPoints: {
					name: 'Hero Points',
					style: 'default',
					current: 0,
					max: 0,
					recoverable: false,
				},
				focusPoints: {
					name: 'Focus Points',
					style: 'default',
					current: 0,
					max: 0,
					recoverable: false,
				},
				hp: { name: 'HP', style: 'default', current: 0, max: 0, recoverable: true },
				tempHp: {
					name: 'Temp HP',
					style: 'default',
					current: 0,
					max: null,
					recoverable: true,
				},
				resolve: {
					name: 'Resolve',
					style: 'default',
					current: 0,
					max: 0,
					recoverable: true,
				},
				stamina: {
					name: 'Stamina',
					style: 'default',
					current: 0,
					max: 0,
					recoverable: true,
				},
			},
			stats: {
				// Perception
				perception: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'wisdom',
				},
				// Class DC/Attack
				class: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: null,
				},
				// Casting
				arcane: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: null,
				},
				divine: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: null,
				},
				occult: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: null,
				},
				primal: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: null,
				},
				// Saves
				fortitude: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'constitution',
				},
				reflex: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'dexterity',
				},
				will: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'wisdom',
				},
				// Skills
				acrobatics: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'dexterity',
				},
				arcana: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'intelligence',
				},
				athletics: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'strength',
				},
				crafting: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'intelligence',
				},
				deception: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'charisma',
				},
				diplomacy: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'charisma',
				},
				intimidation: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'charisma',
				},
				medicine: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'wisdom',
				},
				nature: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'wisdom',
				},
				occultism: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'intelligence',
				},
				performance: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'charisma',
				},
				religion: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'wisdom',
				},
				society: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'intelligence',
				},
				stealth: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'dexterity',
				},
				survival: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'wisdom',
				},
				thievery: {
					total: null,
					totalDC: null,
					proficiency: null,
					ability: 'dexterity',
				},
			},
			additionalSkills: [],
			attacks: [],
			rollMacros: [],
			actions: [],
			modifiers: [],
			sourceData: { aliases: [] },
		};
	}
}
