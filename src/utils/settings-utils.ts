import { AutocompleteInteraction, CacheType, CommandInteraction } from 'discord.js';
import { UserSettings } from '../services/kobold/index.js';
import _ from 'lodash';
import { UserSettingsModel } from '../services/kobold/models/user-settings/user-settings.model.js';

export class SettingsUtils {
	public static get defaultSettings(): UserSettings {
		return {
			userId: '',
			rollCompactMode: 'normal',
			initStatsNotification: 'every_round',
			inlineRollsDisplay: 'detailed',
		};
	}
	public static async getSettingsForUser(
		intr: AutocompleteInteraction<CacheType> | CommandInteraction
	): Promise<UserSettings> {
		let settings: UserSettings | undefined;
		try {
			settings = await UserSettingsModel.query().findOne('userId', intr.user.id);
		} catch {}
		return _.defaults(settings, this.defaultSettings);
	}
}
