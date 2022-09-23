import { WanderersGuide } from './../index';
import type { WG } from './../wanderers-guide.js';
import axios from 'axios';

export class AncestryApi {
	wg: WanderersGuide;
	baseURL: string;

	constructor(wanderersGuide: WanderersGuide) {
		this.baseURL = 'https://wanderersguide.app/api/ancestry';
		this.wg = wanderersGuide;
	}

	async get(ancestryId: number): Promise<WG.AncestryApiResponse> {
		const response = await axios.get(`${this.baseURL}?id=${ancestryId}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.AncestryApiResponse;
	}

	async getName(ancestryName: string): Promise<WG.AncestryApiResponse> {
		const response = await axios.get(`${this.baseURL}?name=${ancestryName}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.AncestryApiResponse;
	}

	async getAll(): Promise<WG.AncestryApiMapResponse> {
		const response = await axios.get(`${this.baseURL}/all}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.AncestryApiMapResponse;
	}
}
