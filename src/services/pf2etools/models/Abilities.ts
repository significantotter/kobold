import { db } from '../pf2eTools-db.js';
import { abilities } from '../schema.js';
import { Ability } from '../pf2etools-types.js';
import { fetchOneJsonFile } from './helpers.js';

export class Abilities {
	static get model() {
		return abilities;
	}
	static async import() {
		await db.delete(abilities).run();

		const abilityJSON = fetchOneJsonFile('abilities') as { ability: Ability[] };

		await db
			.insert(abilities)
			.values(
				abilityJSON.ability.map(ability => ({
					name: ability.name,
					data: ability,
					tags: ability.traits ?? [],
				}))
			)
			.run();
	}
}
