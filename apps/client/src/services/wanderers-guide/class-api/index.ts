import type { WanderersGuide } from '../index.js';
import type { WG } from '../wanderers-guide.js';
import axios from 'axios';

export class ClassApi {
	wg: WanderersGuide;
	baseURL: string;

	constructor(wanderersGuide: WanderersGuide) {
		this.baseURL = 'https://legacy.wanderersguide.app/api/class';
		this.wg = wanderersGuide;
	}

	async get(classId: number): Promise<WG.ClassApiResponse> {
		const response = await axios.get(`${this.baseURL}?id=${classId}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.ClassApiResponse;
	}

	async getName(className: string): Promise<WG.ClassApiResponse> {
		const response = await axios.get(`${this.baseURL}?name=${className}`, {
			headers: this.wg.headers,
		});
		return response.data as WG.ClassApiResponse;
	}

	async getAll(): Promise<WG.ClassApiMapResponse> {
		const response = await axios.get(`${this.baseURL}/all`, {
			headers: this.wg.headers,
		});
		return response.data as WG.ClassApiMapResponse;
	}
}
