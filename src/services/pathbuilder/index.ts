import axios from 'axios';
import FormData from 'form-data';

export class PathBuilder {
	apiKey: string;
	constructor() {}

	public async get({ characterJsonId }: { characterJsonId: string }) {
		return (await axios.get('https://pathbuilder2e.com/json.php?id=' + characterJsonId)).data;
	}
}
