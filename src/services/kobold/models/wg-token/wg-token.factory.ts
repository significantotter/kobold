import { Factory } from 'fishery';
import type { DeepPartial } from 'fishery';
import { WgToken } from './wg-token.model.js';
import { faker } from '@faker-js/faker';

type WgTokenTransientParams = {};

class WgTokenFactoryClass extends Factory<WgToken, WgTokenTransientParams, WgToken> {
	withFakeId() {
		return this.params({
			id: faker.datatype.number(),
		});
	}
}

export const WgTokenFactory = WgTokenFactoryClass.define(({ onCreate }) => {
	onCreate(async builtWgToken => WgToken.query().insert(builtWgToken));

	const wgTokenData: DeepPartial<WgToken> = {
		charId: faker.datatype.number(),
		accessToken: faker.datatype.uuid(),
		expiresAt: faker.date.soon(30).toISOString(),
		accessRights: faker.helpers.arrayElement(['read', 'update']),
		tokenType: 'Bearer',
	};

	return WgToken.fromDatabaseJson(wgTokenData);
});
