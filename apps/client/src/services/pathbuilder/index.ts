import axios from 'axios';
import type { PathBuilder as PathBuilderTypes } from './pathbuilder.js';

export class PathBuilder {
	constructor() {}

	public async get({ characterJsonId }: { characterJsonId: number }) {
		return (
			await axios.get('https://pathbuilder2e.com/json.php?id=' + characterJsonId, {
				headers: {
					'User-Agent':
						'Mozilla/5.0 (compatible; KoboldBot/1.0; +https://github.com/significantotter/kobold)',
				},
			})
		).data as PathBuilderTypes.JsonExport;
	}
}
