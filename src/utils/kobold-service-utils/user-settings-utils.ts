import { Interaction } from 'discord.js';
import _ from 'lodash';
import { Kobold, UserSettings } from '../../services/kobold/index.js';
import { DefaultUtils } from '../default-utils.js';
import { KoboldUtils } from './kobold-utils.js';

export class UserSettingsUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}

	public async getSettingsForUser(intr: Interaction): Promise<UserSettings> {
		let settings = await this.kobold.userSettings.read({ userId: intr.user.id });
		return _.defaults(settings, DefaultUtils.userSettings);
	}
}
