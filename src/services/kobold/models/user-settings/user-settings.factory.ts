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
			characterId: faker.datatype.number(),
			userId: faker.datatype.uuid(),
			guildId: faker.datatype.uuid(),
		};

		return UserSettings.fromDatabaseJson(characterData);
	}
);
