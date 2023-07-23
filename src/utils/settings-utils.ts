import { AutocompleteInteraction, CacheType, CommandInteraction } from 'discord.js';
import { UserSettings } from '../services/kobold/models/index.js';
import _ from 'lodash';

export class SettingsUtils {
	public static async getSettingsForUser(
		intr: AutocompleteInteraction<CacheType> | CommandInteraction
	): Promise<UserSettings> {
		let settings: UserSettings;
		try {
			settings = await UserSettings.query().findOne('userId', intr.user.id);
		} catch {}
		return _.defaults(settings, {
			rollCompactMode: 'normal',
			initStatsNotification: 'every_round',
		});
	}
}
