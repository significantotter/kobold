import type { WanderersGuide } from '../index.js';
import type { WG } from '../wanderers-guide.js';
import axios from 'axios';

export class HeritageApi {
	wg: WanderersGuide;
	baseURL: string;

	constructor(wanderersGuide: WanderersGuide) {
		this.baseURL = 'https://legacy.wanderersguide.app/api/heritage';
		this.wg = wanderersGuide;
	}

	async get(heritageId: number): Promise<WG.AncestryHeritage> {
		const response = await axios.get(`${this.baseURL}?id=${heritageId}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.AncestryHeritage;
	}

	async getName(heritageName: string): Promise<WG.AncestryHeritage> {
		const response = await axios.get(`${this.baseURL}?name=${heritageName}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.AncestryHeritage;
	}

	async getAll(): Promise<WG.AncestryHeritage[]> {
		const response = await axios.get(`${this.baseURL}/all}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.AncestryHeritage[];
	}
}
