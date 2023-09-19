import { AutocompleteInteraction, CacheType, CommandInteraction } from 'discord.js';
import { UserSettings } from '../services/kobold/models/index.js';
import { UserSettings as UserSettingsType } from '../services/kobold/models/user-settings/user-settings.schema.js';
import _ from 'lodash';

export class SettingsUtils {
	public static get defaultSettings(): UserSettingsType {
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
			settings = await UserSettings.query().findOne('userId', intr.user.id);
		} catch {}
		return _.defaults(settings, this.defaultSettings);
	}
}
