import _ from 'lodash';
import { Sheet, SheetInfo } from '../services/kobold/models/index.js';

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

export class SheetProperties {
	public static aliases = SheetInfoProperties.aliases;
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
