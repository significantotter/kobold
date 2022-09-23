import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';
import type { WG } from './wanderers-guide.js';

interface httpHeaders {
	[key: string]: number | string;
}
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

	async get(characterId: number): Promise<WG.CharacterApiResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}`, {
			headers: this.wg.headers,
		});
		const character: WG.CharacterApiResponse = CharacterApi.parseAPIResponse(response.data);
		return character;
	}
	async getCalculatedStats(characterId: number): Promise<WG.CharacterCalculatedStatsApiResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/calculated-stats`, {
			headers: this.wg.headers,
		});
		const calculatedStats: WG.CharacterCalculatedStatsApiResponse =
			CharacterApi.parseAPIResponse(response.data);
		return calculatedStats;
	}

	async getMetadata(characterId: number): Promise<WG.CharacterMetadataAPIResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/metadata`, {
			headers: this.wg.headers,
		});
		const metadata: WG.CharacterMetadataAPIResponse = CharacterApi.parseAPIResponse(
			response.data
		);
		return metadata as WG.CharacterMetadataAPIResponse;
	}

	async getSpells(characterId: number): Promise<WG.CharacterSpellAPIResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/spell`, {
			headers: this.wg.headers,
		});
		const metadata: WG.CharacterSpellAPIResponse = CharacterApi.parseAPIResponse(response.data);
		return metadata as WG.CharacterSpellAPIResponse;
	}

	async getInventory(characterId: number): Promise<WG.CharacterInventoryAPIResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/inventory`, {
			headers: this.wg.headers,
		});
		const metadata: WG.CharacterInventoryAPIResponse = CharacterApi.parseAPIResponse(
			response.data
		);
		return metadata as WG.CharacterInventoryAPIResponse;
	}

	async getConditions(characterId: number): Promise<WG.CharacterConditionsAPIResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/conditions`, {
			headers: this.wg.headers,
		});
		const metadata: WG.CharacterConditionsAPIResponse = CharacterApi.parseAPIResponse(
			response.data
		);
		return metadata as WG.CharacterConditionsAPIResponse;
	}
	async getAllEndpoints(
		characterId: number
	): Promise<
		[
			WG.CharacterApiResponse,
			WG.CharacterCalculatedStatsApiResponse,
			WG.CharacterMetadataAPIResponse,
			WG.CharacterSpellAPIResponse,
			WG.CharacterInventoryAPIResponse,
			WG.CharacterConditionsAPIResponse
		]
	> {
		return await Promise.all([
			this.get(characterId),
			this.getCalculatedStats(characterId),
			this.getMetadata(characterId),
			this.getSpells(characterId),
			this.getInventory(characterId),
			this.getConditions(characterId),
		]);
	}
}

export class WanderersGuide {
	headers: httpHeaders;
	constructor(accessToken) {
		this.headers = { authorization: `Bearer ${accessToken}` };
	}

	get character() {
		return new CharacterApi(this);
	}
}
