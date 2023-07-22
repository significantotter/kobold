import { AutocompleteInteraction, CacheType, CommandInteraction } from 'discord.js';
import { UserSettings } from '../services/kobold/models/index.js';

export class SettingsUtils {
	public static async getSettingsForUser(
		intr: AutocompleteInteraction<CacheType> | CommandInteraction
	): Promise<UserSettings> {
		return;
	}
}
