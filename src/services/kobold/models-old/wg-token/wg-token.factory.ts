import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { WgTokenModel } from './wg-token.model.js';
import { faker } from '@faker-js/faker';

type WgTokenTransientParams = {};

class WgTokenFactoryClass extends Factory<WgTokenModel, WgTokenTransientParams, WgTokenModel> {
	withFakeId() {
		return this.params({
			id: faker.number.int(2147483647),
		});
	}
}

export const WgTokenFactory = WgTokenFactoryClass.define(({ onCreate }) => {
	onCreate(async builtWgToken => WgTokenModel.query().insert(builtWgToken));

	const wgTokenData: DeepPartial<WgTokenModel> = {
		charId: faker.number.int(2147483647),
		accessToken: faker.string.uuid(),
		expiresAt: faker.date.soon({ days: 30 }).toISOString(),
		accessRights: faker.helpers.arrayElement(['read', 'update']),
		tokenType: 'Bearer',
	};

	return WgTokenModel.fromDatabaseJson(wgTokenData);
});
