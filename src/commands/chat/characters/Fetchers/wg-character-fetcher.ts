import { Config } from '../../../../config/config.js';
import L from '../../../../i18n/i18n-node.js';
import {
	SheetRecord,
	Character,
	CharacterWithRelations,
	NewSheetRecord,
} from '../../../../services/kobold/index.js';
import { WanderersGuide } from '../../../../services/wanderers-guide/index.js';
import { WG } from '../../../../services/wanderers-guide/wanderers-guide.js';
import { KoboldError } from '../../../../utils/KoboldError.js';
import { Creature } from '../../../../utils/creature.js';
import { CharacterFetcher } from './character-fetcher.js';
import { default as axios } from 'axios';

export class WgCharacterFetcher extends CharacterFetcher<
	{
		characterData: WG.CharacterApiResponse;
		calculatedStats: WG.CharacterCalculatedStatsApiResponse;
	},
	{ charId: number }
> {
	public importSource = 'wg';

	public async fetchDuplicateCharacter(
		args: { charId: number },
		newSheetRecord: SheetRecord
	): Promise<Character | null> {
		// we can't use a character that shares a charId OR shares a name
		const results = await Promise.all([
			this.kobold.character.read({
				charId: args.charId,
				userId: this.userId,
			}),
			this.kobold.character.read({
				name: newSheetRecord.sheet.staticInfo.name,
				userId: this.userId,
			}),
		]);
		return results.find(result => result !== null) ?? null;
	}

	public async fetchWgCharacterFromToken(
		charId: number,
		token: string
	): Promise<{
		characterData: WG.CharacterApiResponse;
		calculatedStats: WG.CharacterCalculatedStatsApiResponse;
	}> {
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
			characterData,
			calculatedStats,
		};
	}

	public requestAccessToken(charId: number, expired: boolean = false): never {
		// The user needs to authenticate!
		const respond =
			this.intr.deferred || this.intr.replied ? this.intr.followUp : this.intr.reply;
		if (expired) {
			respond(L.en.commands.character.interactions.expiredToken());
		} else {
			respond(
				L.en.commands.character.interactions.authenticationRequest({
					action: 'fetch',
				})
			);
		}
		throw new KoboldError(
			L.en.commands.character.interactions.authenticationLink({
				wgBaseUrl: Config.wanderersGuide.oauthBaseUrl,
				charId: charId,
			})
		);
	}

	public async fetchSourceData(
		args: { charId: number },
		activeCharacter?: Character
	): Promise<{
		characterData: WG.CharacterApiResponse;
		calculatedStats: WG.CharacterCalculatedStatsApiResponse;
	}> {
		let token: string | undefined = undefined;
		if (activeCharacter) {
			const authToken = await this.kobold.wgAuthToken.read({
				charId: activeCharacter.charId,
			});
			if (authToken?.accessToken) token = authToken.accessToken;
		}

		// create a token, throwing an error and ending the process
		if (!token) {
			this.requestAccessToken(args.charId);
		} else {
			// try to fetch the character from WG
			try {
				return await this.fetchWgCharacterFromToken(args.charId, token);
			} catch (err) {
				// on an error, end the process and figure out what kind of error we have
				console.warn(err);
				if ((axios.default ?? axios).isAxiosError(err) && err?.response?.status === 401) {
					//token expired!
					// the catch ensures we don't fail if no tokens are deleted
					this.kobold.wgAuthToken.delete({ charId: args.charId }).catch(() => {});
					this.requestAccessToken(args.charId, true);
				} else if (
					(axios.default ?? axios).isAxiosError(err) &&
					err?.response?.status === 429
				) {
					throw new KoboldError(L.en.commands.character.interactions.tooManyWGRequests());
				} else {
					//otherwise, something else went wrong that we want to be a real error
					console.error(err);
					throw new KoboldError(
						`Yip! Something went wrong when I tried to fetch the character update from wanderer's guide!.`
					);
				}
			}
		}
	}

	public convertSheetRecord(
		sourceData: {
			characterData: WG.CharacterApiResponse;
			calculatedStats: WG.CharacterCalculatedStatsApiResponse;
		},
		activeCharacter?: CharacterWithRelations
	): NewSheetRecord {
		const creature = Creature.fromWandererersGuide(
			sourceData.calculatedStats,
			sourceData.characterData,
			activeCharacter?.sheetRecord
		);
		return {
			sheet: creature._sheet,
			actions: creature.actions,
			modifiers: creature.modifiers,
			rollMacros: creature.rollMacros,
		} satisfies NewSheetRecord;
	}
	public getCharId(args: { charId: number }): number {
		return args.charId;
	}
}
