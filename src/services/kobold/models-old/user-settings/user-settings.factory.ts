import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { UserSettingsModel } from './user-settings.model.js';
import { faker } from '@faker-js/faker';

type UserSettingsTransientParams = {};

class UserSettingsFactoryClass extends Factory<
	UserSettingsModel,
	UserSettingsTransientParams,
	UserSettingsModel
> {}

export const UserSettingsFactory = UserSettingsFactoryClass.define(({ onCreate }) => {
	onCreate(async builtUserSettings => {
		console.log(builtUserSettings);
		return UserSettingsModel.query().insert(builtUserSettings.toJSON());
	});

	const characterData: DeepPartial<UserSettingsModel> = {
		userId: faker.string.uuid(),
		initStatsNotification: faker.helpers.arrayElement([
			'never',
			'every_turn',
			'every_round',
			'whenever_hidden',
		]),
		inlineRollsDisplay: faker.helpers.arrayElement(['detailed', 'compact']),
		rollCompactMode: faker.helpers.arrayElement(['compact', 'normal']),
	};

	return UserSettingsModel.fromDatabaseJson(characterData);
});
