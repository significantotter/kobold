import axios from 'axios';
import FormData from 'form-data';
import type { PathBuilder as PathBuilderTypes } from './pathbuilder.js';

export class PathBuilder {
	apiKey: string;
	constructor() {}

	public async get({ characterJsonId }: { characterJsonId: number }) {
		return (await axios.default.get('https://pathbuilder2e.com/json.php?id=' + characterJsonId))
			.data as PathBuilderTypes.JsonExport;
	}
}
