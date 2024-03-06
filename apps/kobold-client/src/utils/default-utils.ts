import {
	InitStatsNotificationEnum,
	InlineRollsDisplayEnum,
	RollCompactModeEnum,
	UserSettings,
} from 'kobold-db';

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
