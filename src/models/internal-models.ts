import { Locale } from 'discord.js';

import { Language } from './enum-helpers/index.js';

// This class is used to store and pass data along in events
export class EventData {
	constructor() {
		// TODO: Pass in event data (e.g. server and user data) from constructor
	}

	public lang(): Locale {
		// TODO: Calculate language based on event data
		return Language.Default;
	}
}
