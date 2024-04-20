import type { WanderersGuide } from './../index.js';
import type { WG } from './../wanderers-guide.js';
import axios from 'axios';

export class CharacterApi {
	wg: WanderersGuide;
	baseURL: string;

	constructor(wanderersGuide: WanderersGuide) {
		this.baseURL = 'https://legacy.wanderersguide.app/api/char';
		this.wg = wanderersGuide;
	}

	static parseApiResponse(response: any) {
		const propertiesToJSONParse = [
			'conditions',
			'totalSkills',
			'totalStats',
			'totalSaves',
			'totalAbilityScores',
			'weapons',
			'infoJSON',
			'generalInfo',
		];
		for (const property of propertiesToJSONParse) {
			if (response[property]) response[property] = JSON.parse(response[property]);
		}
		return response;
	}

	async get(characterId: number): Promise<WG.CharacterApiResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}`, {
			headers: this.wg.headers,
		});
		const character: WG.CharacterApiResponse = CharacterApi.parseApiResponse(response.data);
		return character;
	}
	async getCalculatedStats(characterId: number): Promise<WG.CharacterCalculatedStatsApiResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/calculated-stats`, {
			headers: this.wg.headers,
		});
		const calculatedStats: WG.CharacterCalculatedStatsApiResponse =
			CharacterApi.parseApiResponse(response.data);
		return calculatedStats;
	}

	async getMetadata(characterId: number): Promise<WG.CharacterMetadataApiResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/metadata`, {
			headers: this.wg.headers,
		});
		const metadata: WG.CharacterMetadataApiResponse = CharacterApi.parseApiResponse(
			response.data
		);
		return metadata as WG.CharacterMetadataApiResponse;
	}

	async getSpells(characterId: number): Promise<WG.CharacterSpellApiResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/spell`, {
			headers: this.wg.headers,
		});
		const metadata: WG.CharacterSpellApiResponse = CharacterApi.parseApiResponse(response.data);
		return metadata as WG.CharacterSpellApiResponse;
	}

	async getInventory(characterId: number): Promise<WG.CharacterInventoryApiResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/inventory`, {
			headers: this.wg.headers,
		});
		const metadata: WG.CharacterInventoryApiResponse = CharacterApi.parseApiResponse(
			response.data
		);
		return metadata as WG.CharacterInventoryApiResponse;
	}

	async getConditions(characterId: number): Promise<WG.CharacterConditionsApiResponse> {
		const response = await axios.get(`${this.baseURL}/${characterId}/conditions`, {
			headers: this.wg.headers,
		});
		const metadata: WG.CharacterConditionsApiResponse = CharacterApi.parseApiResponse(
			response.data
		);
		return metadata as WG.CharacterConditionsApiResponse;
	}
}
