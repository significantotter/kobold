import { CharacterApi } from './character-api/index.js';
import { ClassApi } from './class-api/index.js';
import { AncestryApi } from './ancestry-api/index.js';
import { BackgroundApi } from './background-api/index.js';
import { HeritageApi } from './heritage-api/index.js';
import { VHeritageApi } from './v-heritage-api/index.js';
export * from './wanderers-guide.zod.js';

interface httpHeaders {
	[key: string]: number | string;
}
interface WanderersGuideConstructorParams {
	token?: string;
	apiKey?: string;
}
export class WanderersGuide {
	headers?: httpHeaders;
	constructor({ token: accessToken, apiKey }: WanderersGuideConstructorParams) {
		if (accessToken) {
			this.headers = { authorization: `Bearer ${accessToken}` };
		} else if (apiKey) {
			this.headers = { authorization: `Apikey ${apiKey}` };
		}
	}

	get character() {
		return new CharacterApi(this);
	}

	get class() {
		return new ClassApi(this);
	}

	get background() {
		return new BackgroundApi(this);
	}

	get ancestry() {
		return new AncestryApi(this);
	}

	get heritage() {
		return new HeritageApi(this);
	}

	get vHeritage() {
		return new VHeritageApi(this);
	}
}
