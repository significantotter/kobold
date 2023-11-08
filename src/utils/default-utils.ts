import { UserSettings } from '../services/kobold/index.js';

export class DefaultUtils {
	public static get userSettings(): UserSettings {
		return {
			userId: '',
			rollCompactMode: 'normal',
			initStatsNotification: 'every_round',
			inlineRollsDisplay: 'detailed',
		};
	}
}
