import axios from 'axios';
import FormData from 'form-data';

export class PasteBin {
	public apiKey?: string;
	constructor({ apiKey }: { apiKey?: string }) {
		this.apiKey = apiKey;
	}

	public async post({ code, name, format = 'json', expires = '1M' }: { [k: string]: string }) {
		const formData = new FormData();
		formData.append('api_dev_key', this.apiKey);
		formData.append('api_paste_code', code);
		formData.append('api_option', 'paste');
		formData.append('api_paste_format', format);
		formData.append('api_paste_expire_date', expires);
		formData.append('api_paste_name', name);
		return (
			await axios.default.post('https://pastebin.com/api/api_post.php', formData, {
				headers: formData.getHeaders(),
			})
		).data;
	}

	public async get({ paste_key }: { paste_key: string }) {
		return (await axios.default.get('https://pastebin.com/raw/' + paste_key)).data;
	}
}
