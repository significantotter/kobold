import { AbilityEnum, Sheet } from '../schemas/shared/sheet.zod.js';

export function getDefaultSheet(): Sheet {
	{
		return {
			staticInfo: {
				name: '',
				level: null,
				usesStamina: false,
				keyAbility: null,
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
					name: 'Perception',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.wisdom,
					note: null,
				},
				// Class DC/Attack
				class: {
					name: 'Class',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: null,
					note: null,
				},
				// Casting
				arcane: {
					name: 'Arcane',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: null,
					note: null,
				},
				divine: {
					name: 'Divine',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: null,
					note: null,
				},
				occult: {
					name: 'Occult',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: null,
					note: null,
				},
				primal: {
					name: 'Primal',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: null,
					note: null,
				},
				// Saves
				fortitude: {
					name: 'Fortitude',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.constitution,
					note: null,
				},
				reflex: {
					name: 'Reflex',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.dexterity,
					note: null,
				},
				will: {
					name: 'Will',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.wisdom,
					note: null,
				},
				// Skills
				acrobatics: {
					name: 'Acrobatics',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.dexterity,
					note: null,
				},
				arcana: {
					name: 'Arcana',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.intelligence,
					note: null,
				},
				athletics: {
					name: 'Athletics',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.strength,
					note: null,
				},
				crafting: {
					name: 'Crafting',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.intelligence,
					note: null,
				},
				deception: {
					name: 'Deception',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.charisma,
					note: null,
				},
				diplomacy: {
					name: 'Diplomacy',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.charisma,
					note: null,
				},
				intimidation: {
					name: 'Intimidation',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.charisma,
					note: null,
				},
				medicine: {
					name: 'Medicine',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.wisdom,
					note: null,
				},
				nature: {
					name: 'Nature',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.wisdom,
					note: null,
				},
				occultism: {
					name: 'Occultism',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.intelligence,
					note: null,
				},
				performance: {
					name: 'Performance',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.charisma,
					note: null,
				},
				religion: {
					name: 'Religion',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.wisdom,
					note: null,
				},
				society: {
					name: 'Society',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.intelligence,
					note: null,
				},
				stealth: {
					name: 'Stealth',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.dexterity,
					note: null,
				},
				survival: {
					name: 'Survival',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.wisdom,
					note: null,
				},
				thievery: {
					name: 'Thievery',
					bonus: null,
					dc: null,
					proficiency: null,
					ability: AbilityEnum.dexterity,
					note: null,
				},
			},
			additionalSkills: [],
			attacks: [],
			rollMacros: [],
			actions: [],
			modifiers: [],
			sourceData: {},
		};
	}
}
