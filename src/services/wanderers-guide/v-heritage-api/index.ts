import { WanderersGuide } from '../index';
import type { WG } from '../wanderers-guide.js';
import axios from 'axios';

export class VHeritageApi {
	wg: WanderersGuide;
	baseURL: string;

	constructor(wanderersGuide: WanderersGuide) {
		this.baseURL = 'https://wanderersguide.app/api/v-heritage';
		this.wg = wanderersGuide;
	}

	async get(vheritageId: number): Promise<WG.VHeritageApiResponse> {
		const response = await axios.get(`${this.baseURL}?id=${vheritageId}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.VHeritageApiResponse;
	}

	async getName(vheritageName: string): Promise<WG.VHeritageApiResponse> {
		const response = await axios.get(`${this.baseURL}?name=${vheritageName}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.VHeritageApiResponse;
	}

	async getAll(): Promise<WG.VHeritageApiResponse[]> {
		const response = await axios.get(`${this.baseURL}/all}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.VHeritageApiResponse[];
	}
}
