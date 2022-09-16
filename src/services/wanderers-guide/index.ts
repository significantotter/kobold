import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

interface httpHeaders {
	[key: string]: number | string;
}
interface CharacterApiResponse {
	id: number;
	userID: number;
	buildID: null;
	name: string;
	level: number;
	experience: number;
	currentHealth: number;
	tempHealth: null | number;
	heroPoints: null | number;
	ancestryID: null | number;
	heritageID: null | number;
	uniHeritageID: null | number;
	backgroundID: null | number;
	classID: null | number;
	classID_2: null | number;
	inventoryID: number;
	notes: null;
	infoJSON: { imageUrl: string; pronouns: string; [key: string]: any };
	rollHistoryJSON: any;
	details: any;
	customCode: any;
	dataID: null | number;
	currentStamina: null | number;
	currentResolve: null | number;
	builderByLevel: number;
	optionAutoDetectPreReqs: number;
	optionAutoHeightenSpells: number;
	optionPublicCharacter: number;
	optionCustomCodeBlock: number;
	optionDiceRoller: number;
	optionClassArchetypes: number;
	optionIgnoreBulk: number;
	variantProfWithoutLevel: number;
	variantFreeArchetype: number;
	variantAncestryParagon: number;
	variantStamina: number;
	variantAutoBonusProgression: number;
	variantGradualAbilityBoosts: number;
	enabledSources: string[];
	enabledHomebrew: any[];
	createdAt: string;
	updatedAt: string;
	[key: string]: any;
}

interface NamedBonus {
	Name: string;
	Bonus: number | null;
	[key: string]: any;
}

interface Attack {
	Name: string;
	Bonus: number | null;
	Damage: String | null;
	[key: string]: any;
}

interface CharacterCalculatedStatsApiResponse {
	charID: number;
	maxHP: number | null;
	totalClassDC: number | null;
	totalSpeed: number | null;
	totalAC: number | null;
	totalPerception: number | null;
	totalSkills: NamedBonus[];
	totalSaves: NamedBonus[];
	totalAbilityScores: NamedBonus[];
	weapons: Attack[];
	createdAt: Date;
	updatedAt: Date;
	[key: string]: any;
}

interface CharacterMetadataAPIResponseItem {
	charID: number;
	source: string;
	sourceType: string;
	sourceLevel: number;
	sourceCode: string;
	sourceCodeSNum: string;
	value: string;
	createdAt: string;
	updatedAt: string;
	[key: string]: any;
}
type CharacterMetadataAPIResponse = CharacterMetadataAPIResponseItem[];

class CharacterApi {
	wg: WanderersGuide;
	baseURL: string;

	constructor(wanderersGuide: WanderersGuide) {
		this.baseURL = 'https://wanderersguide.app/api/char';
		this.wg = wanderersGuide;
	}

	static parseAPIResponse(response: any) {
		const propertiesToJSONParse = [
			'totalSkills',
			'totalStats',
			'totalSaves',
			'totalAbilityScores',
			'weapons',
		];
		const propertiesToDateParse = ['createdAt', 'updatedAt'];
		for (const property of propertiesToJSONParse) {
			if (response[property]) response[property] = JSON.parse(response[property]);
		}
		for (const property of propertiesToDateParse) {
			if (response[property]) response[property] = new Date(response[property]);
		}
		return response;
	}

	async get(characterId: number): Promise<CharacterApiResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}`, {
			headers: this.wg.headers,
		});
		const character: CharacterApiResponse = CharacterApi.parseAPIResponse(response.data);
		return character;
	}
	async getCalculatedStats(characterId: number) {
		const response = await axios.get(`${this.baseURL}/${characterId}/calculated-stats`, {
			headers: this.wg.headers,
		});
		const calculatedStats: CharacterCalculatedStatsApiResponse = CharacterApi.parseAPIResponse(
			response.data
		);
		return calculatedStats;
	}

	async getMetadata(characterId: number): Promise<CharacterMetadataAPIResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/metadata`, {
			headers: this.wg.headers,
		});
		const metadata: CharacterMetadataAPIResponse = CharacterApi.parseAPIResponse(response.data);
		return metadata as CharacterMetadataAPIResponse;
	}
}

export class WanderersGuide {
	headers: httpHeaders;
	constructor(accessToken) {
		this.headers = { authorization: `Bearer ${accessToken}` };
	}

	character() {
		return new CharacterApi(this);
	}
}
