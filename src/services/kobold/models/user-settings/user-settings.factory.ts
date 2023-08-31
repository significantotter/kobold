import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { UserSettings } from './user-settings.model.js';
import { faker } from '@faker-js/faker';

type UserSettingsTransientParams = {};

class UserSettingsFactoryClass extends Factory<
	UserSettings,
	UserSettingsTransientParams,
	UserSettings
> {}

export const UserSettingsFactory = UserSettingsFactoryClass.define(
	({ onCreate, transientParams }) => {
		onCreate(async builtUserSettings => UserSettings.query().insert(builtUserSettings));

		const characterData: DeepPartial<UserSettings> = {
			userId: faker.datatype.uuid(),
			initStatsNotification: faker.helpers.arrayElement([
				'never',
				'every_turn',
				'every_round',
				'whenever_hidden',
			]),
			inlineRollsDisplay: faker.helpers.arrayElement(['detailed', 'compact']),
			rollCompactMode: faker.helpers.arrayElement(['compact', 'normal']),
		};

		return UserSettings.fromDatabaseJson(characterData);
	}
);
