import {
	InitStatsNotificationEnum,
	InlineRollsDisplayEnum,
	RollCompactModeEnum,
	UserSettings,
} from '../services/kobold/index.js';

export class DefaultUtils {
	public static get userSettings(): UserSettings {
		return {
			userId: '',
			inlineRollsDisplay: InlineRollsDisplayEnum.detailed,
			rollCompactMode: RollCompactModeEnum.normal,
			initStatsNotification: InitStatsNotificationEnum.every_round,
		};
	}
}
