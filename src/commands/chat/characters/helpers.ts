import { WanderersGuide } from '../../../services/wanderers-guide/index.js';
import { Config } from '../../../config/config.js';
import { Creature } from '../../../utils/creature.js';
import { Sheet, SheetRecord } from '../../../services/kobold/index.js';

export class CharacterHelpers {
	public static async fetchWgCharacterFromToken(
		charId: number,
		token: string,
		oldSheetRecord?: SheetRecord
	) {
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
				generalInfo: {
					className: '',
					heritageAncestryName: '',
					backgroundName: '',
					size: '',
					traits: [],
				},
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

		const classPromise = classId ? WGApiKeyApi.class.get(classId) : Promise.resolve(null);
		const classPromise2 = classId2 ? WGApiKeyApi.class.get(classId2) : Promise.resolve(null);
		const ancestryPromise = ancestryId
			? WGApiKeyApi.ancestry.get(ancestryId)
			: Promise.resolve(null);
		const heritagePromise = heritageId
			? WGApiKeyApi.heritage.get(heritageId)
			: Promise.resolve(null);
		const vHeritagePromise = vHeritageId
			? WGApiKeyApi.vHeritage.get(vHeritageId)
			: Promise.resolve(null);
		const backgroundPromise = backgroundId
			? WGApiKeyApi.background.get(backgroundId)
			: Promise.resolve(null);

		const getNameFunctions = [
			classPromise,
			classPromise2,
			ancestryPromise,
			heritagePromise,
			vHeritagePromise,
			backgroundPromise,
		];

		let className: string,
			classKeyAbility: string,
			className2: string,
			ancestryName: string,
			heritageName: string,
			vHeritageName: string,
			backgroundName: string;

		await Promise.allSettled(getNameFunctions);

		try {
			const classResult = await classPromise;
			className = classResult?.class?.name ?? '';
			classKeyAbility = classResult?.class?.keyAbility ?? '';
		} catch {
			className = '';
			classKeyAbility = '';
		}
		try {
			const classResult2 = await classPromise2;
			className2 = classResult2?.class?.name ?? '';
		} catch {
			className2 = '';
		}
		try {
			const ancestryResult = await ancestryPromise;
			ancestryName = ancestryResult?.ancestry?.name ?? '';
		} catch {
			ancestryName = '';
		}
		try {
			const heritageResult = await heritagePromise;
			heritageName = heritageResult?.heritage?.name ?? '';
		} catch {
			heritageName = '';
		}
		try {
			const vHeritageResult = await vHeritagePromise;
			vHeritageName = vHeritageResult?.vHeritage?.name ?? '';
		} catch {
			vHeritageName = '';
		}
		try {
			const backgroundResult = await backgroundPromise;
			backgroundName = backgroundResult?.background?.name ?? '';
		} catch {
			backgroundName = '';
		}

		//add these name properties to the character data
		characterData.infoJSON = {
			...characterData,
			...{
				className,
				classKeyAbility,
				className2,
				ancestryName,
				heritageName,
				vHeritageName,
				backgroundName,
			},
		};

		const creature = Creature.fromWandererersGuide(
			calculatedStats,
			characterData,
			oldSheetRecord
		);

		return creature;
	}
}
