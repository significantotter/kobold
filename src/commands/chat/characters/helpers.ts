import { WanderersGuide } from '../../../services/wanderers-guide/index.js';
import { Config } from '../../../config/config.js';
import { WG } from '../../../services/wanderers-guide/wanderers-guide.js';

export const attributeAbilityMap = {
	acrobatics: 'dexterity',
	arcana: 'intelligence',
	athletics: 'strength',
	crafting: 'intelligence',
	deception: 'charisma',
	diplomacy: 'charisma',
	intimidation: 'charisma',
	medicine: 'wisdom',
	nature: 'wisdom',
	occultism: 'intelligence',
	performance: 'charisma',
	religion: 'wisdom',
	society: 'intelligence',
	stealth: 'dexterity',
	survival: 'wisdom',
	thievery: 'dexterity',
	perception: 'wisdom',

	fortitude: 'constitution',
	reflex: 'dexterity',
	will: 'wisdom',

	strength: 'strength',
	dexterity: 'dexterity',
	constitution: 'constitution',
	intelligence: 'intelligence',
	wisdom: 'wisdom',
	charisma: 'charisma',
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

		if (!characterData.name) {
			characterData.name = 'Unnamed Character';
		}

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

		const character = {
			charId,
			isActiveCharacter: true,
			characterData,
			calculatedStats,
		};

		const attributes = this.parseAttributesForCharacter(character);

		return {
			...character,
			attributes,
		};
	}

	public static parseAttributesForCharacter(character: {
		[k: string]: any;
		characterData: WG.CharacterApiResponse;
		calculatedStats: WG.CharacterCalculatedStatsApiResponse;
	}): {
		[k: string]: any;
		name?: string;
		type?: string;
		value?: number;
		tags?: string[];
	}[] {
		const { characterData, calculatedStats } = character;
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
				name: 'classDc',
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
				tags: ['ability', abilityScore.Name.toLocaleLowerCase()],
			});
		}
		for (const save of calculatedStats.totalSaves) {
			const attr = {
				name: save.Name,
				value: Number(save.Bonus),
				type: 'save',
				tags: ['save', save.Name.toLocaleLowerCase()],
			};
			if (attributeAbilityMap[save.Name.toLocaleLowerCase()])
				attr.tags.push(attributeAbilityMap[save.Name.toLocaleLowerCase()]);
			attributes.push(attr);
		}
		for (const skill of calculatedStats.totalSkills) {
			const attr = {
				name: skill.Name,
				value: Number(skill.Bonus),
				type: 'skill',
				tags: ['skill', skill.Name.toLocaleLowerCase()],
			};
			if (attributeAbilityMap[skill.Name.toLocaleLowerCase()])
				attr.tags.push(attributeAbilityMap[skill.Name.toLocaleLowerCase()]);
			if ((skill.Name as string).toLocaleLowerCase().includes('lore'))
				attr.tags.push('intelligence');
			attributes.push(attr);
		}

		return attributes;
	}
}
