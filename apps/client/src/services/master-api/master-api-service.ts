import { URL } from 'node:url';

import { Config } from 'kobold-config';
import { HttpService } from '../http-service.js';
import {
	LoginClusterResponse,
	RegisterClusterRequest,
	RegisterClusterResponse,
} from './clusters.js';

export class MasterApiService {
	protected clusterId: string;

	constructor(protected httpService: HttpService) {
		this.clusterId = '';
	}

	public async register(): Promise<void> {
		let reqBody: RegisterClusterRequest = {
			shardCount: Config.clustering.shardCount,
			callback: {
				url: Config.clustering.callbackUrl,
				token: Config.api.secret,
			},
		};

		let res = await this.httpService.post(
			new URL('/clusters', Config.clustering.masterApi.url),
			Config.clustering.masterApi.token,
			reqBody
		);

		if (!res.ok) {
			throw res;
		}

		let resBody = (await res.json()) as RegisterClusterResponse;
		this.clusterId = resBody.id;
	}

	public async login(): Promise<LoginClusterResponse> {
		let res = await this.httpService.put(
			new URL(`/clusters/${this.clusterId}/login`, Config.clustering.masterApi.url),
			Config.clustering.masterApi.token
		);

		if (!res.ok) {
			throw res;
		}

		return (await res.json()) as LoginClusterResponse;
	}

	public async ready(): Promise<void> {
		let res = await this.httpService.put(
			new URL(`/clusters/${this.clusterId}/ready`, Config.clustering.masterApi.url),
			Config.clustering.masterApi.token
		);

		if (!res.ok) {
			throw res;
		}
	}
}
