import { WanderersGuide } from '../../../services/wanderers-guide/index.js';
import Config from '../../../config/config.json';

const attributeAbilityMap = {
	Acrobatics: 'dexterity',
	Arcana: 'intelligence',
	Athletics: 'strength',
	Crafting: 'intelligence',
	Deception: 'charisma',
	Diplomacy: 'charisma',
	Intimidation: 'charisma',
	Medicine: 'wisdom',
	Nature: 'wisdom',
	Occultism: 'intelligence',
	Performance: 'charisma',
	Religion: 'dexterity',
	Society: 'intelligence',
	Stealth: 'dexterity',
	Survival: 'wisdom',
	Thievery: 'dexterity',
	Perception: 'wisdom',

	Fortitude: 'constitution',
	Reflex: 'dexterity',
	Will: 'wisdom',

	Strength: 'strength',
	Dexterity: 'dexterity',
	Constitution: 'constitution',
	Intelligence: 'intelligence',
	Wisdom: 'wisdom',
	Charisma: 'charisma',
};

export class CharacterHelpers {
	public static async fetchWgCharacterFromToken(charId: number, token: string) {
		const WGTokenApi = new WanderersGuide({ token });

		const WGApiKeyApi = new WanderersGuide({ apiKey: Config.wanderersGuide.apiKey });

		let [characterData, calculatedStats] = await Promise.all([
			// request sheet data from WG API
			await WGTokenApi.character.get(charId),
			await WGTokenApi.character.getCalculatedStats(charId),
		]);

		if (!calculatedStats) {
			// stub in default calculated stats
			// this should only happen on trying to import an empty character
			calculatedStats = {
				charID: characterData.id,
				maxHP: null,
				maxResolve: null,
				maxStamina: null,
				conditions: [],
				totalClassDC: null,
				totalSpeed: null,
				totalAC: null,
				totalPerception: null,
				totalSkills: [],
				totalSaves: [],
				totalAbilityScores: [],
				weapons: [],
				createdAt: characterData.createdAt,
				updatedAt: characterData.updatedAt,
			};
		}

		// fetch the names of each value referenced as an id, so we don't have to later

		const classId = characterData.classID;
		const classId2 = characterData.classID_2;
		const ancestryId = characterData.ancestryID;
		const heritageId = characterData.heritageID;
		const vHeritageId = characterData.uniHeritageID;
		const backgroundId = characterData.backgroundID;

		const getNameFunctions = [
			async () => {
				if (classId) {
					const response = await WGApiKeyApi.class.get(classId);
					return response.class.name;
				} else return '';
			},
			async () => {
				if (classId2) {
					const response = await WGApiKeyApi.class.get(classId2);
					return response.class.name;
				} else return '';
			},
			async () => {
				if (ancestryId) {
					const response = await WGApiKeyApi.ancestry.get(ancestryId);
					return response.ancestry.name;
				} else return '';
			},
			async () => {
				if (heritageId) {
					const response = await WGApiKeyApi.heritage.get(heritageId);
					return response.name;
				} else return '';
			},
			async () => {
				if (vHeritageId) {
					const response = await WGApiKeyApi.vHeritage.get(vHeritageId);
					return response.heritage.name;
				} else return '';
			},
			async () => {
				if (backgroundId) {
					const response = await WGApiKeyApi.background.get(backgroundId);
					return response.background.name;
				} else return '';
			},
		];

		const [className, className2, ancestryName, heritageName, vHeritageName, backgroundName] =
			await Promise.all(
				getNameFunctions.map(async nameFn => {
					try {
						return await nameFn();
					} catch (err) {
						console.warn(err);
						//fail gracefully if we don't find the data or the API times out
						return '';
					}
				})
			);

		//add these name properties to the character data
		characterData = {
			...characterData,
			className,
			className2,
			ancestryName,
			heritageName,
			vHeritageName,
			backgroundName,
		};

		return {
			charId,
			isActiveCharacter: true,
			characterData,
			calculatedStats,
		};
	}

	public static parseAttributesForCharacter(character) {
		const characterData = character.character_data;
		const calculatedStats = character.calculated_stats;
		const attributes = [
			{ name: 'level', type: 'base', value: characterData.level, tags: ['level'] },
			{ name: 'maxHp', type: 'base', value: calculatedStats.maxHP, tags: ['maxHp'] },
			{
				name: 'hp',
				type: 'base',
				value: characterData.currentHealth ?? calculatedStats.maxHP,
				tags: ['hp'],
			},
			{
				name: 'tempHp',
				type: 'base',
				value: characterData.tempHealth ?? 0,
				tags: ['tempHp'],
			},
			{ name: 'ac', type: 'base', value: calculatedStats.totalAC, tags: ['ac'] },
			{
				name: 'heroPoints',
				type: 'base',
				value: characterData.heroPoints,
				tags: ['heroPoints'],
			},

			{ name: 'speed', type: 'base', value: calculatedStats.totalSpeed, tags: ['speed'] },
			{
				name: 'classDC',
				type: 'base',
				value: calculatedStats.totalClassDC,
				tags: ['classDc'],
			},
			{
				name: 'perception',
				type: 'skill',
				value: calculatedStats.totalPerception,
				tags: ['skill', 'perception'],
			},
		];
		if (characterData.variantStamina) {
			attributes.push(
				{
					name: 'maxStamina',
					type: 'base',
					value: calculatedStats.maxStamina,
					tags: ['maxStamina'],
				},
				{
					name: 'maxResolve',
					type: 'base',
					value: calculatedStats.maxResolve,
					tags: ['maxResolve'],
				},
				{
					name: 'stamina',
					type: 'base',
					value: characterData.currentStamina ?? 0,
					tags: ['stamina'],
				},
				{
					name: 'resolve',
					type: 'base',
					value: characterData.currentResolve ?? 0,
					tags: ['resolve'],
				}
			);
		}
		for (const abilityScore of calculatedStats.totalAbilityScores) {
			attributes.push({
				name: abilityScore.Name,
				value: Math.floor((abilityScore.Score - 10) / 2),
				type: 'ability',
				tags: ['ability', abilityScore.Name.toLowerCase()],
			});
		}
		for (const save of calculatedStats.totalSaves) {
			const attr = {
				name: save.Name,
				value: save.Bonus,
				type: 'save',
				tags: ['save', save.Name.toLowerCase()],
			};
			if (attributeAbilityMap[save.Name]) attr.tags.push(attributeAbilityMap[save.Name]);
			attributes.push(attr);
		}
		for (const skill of calculatedStats.totalSkills) {
			const attr = {
				name: skill.Name,
				value: skill.Bonus,
				type: 'skill',
				tags: ['skill', skill.Name.toLowerCase()],
			};
			if (attributeAbilityMap[skill.Name]) attr.tags.push(attributeAbilityMap[skill.Name]);
			attributes.push(attr);
		}

		return {
			id: character.id,
			attributes,
		};
	}
}
