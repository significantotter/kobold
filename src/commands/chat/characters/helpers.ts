import { WanderersGuide } from '../../../services/wanderers-guide/index.js';
import Config from '../../../config/config.json';

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
}
