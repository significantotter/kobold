import type { WanderersGuide } from './../index.js';
import type { WG } from './../wanderers-guide.js';
import axios from 'axios';

export class BackgroundApi {
	wg: WanderersGuide;
	baseURL: string;

	constructor(wanderersGuide: WanderersGuide) {
		this.baseURL = 'https://wanderersguide.app/api/background';
		this.wg = wanderersGuide;
	}

	async get(backgroundId: number): Promise<WG.BackgroundApiResponse> {
		const response = await axios.get(`${this.baseURL}?id=${backgroundId}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.BackgroundApiResponse;
	}

	async getName(backgroundName: string): Promise<WG.BackgroundApiResponse> {
		const response = await axios.get(`${this.baseURL}?name=${backgroundName}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.BackgroundApiResponse;
	}

	async getAll(): Promise<WG.BackgroundApiResponse[]> {
		const response = await axios.get(`${this.baseURL}/all}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.BackgroundApiResponse[];
	}
}
