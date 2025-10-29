import _ from 'lodash';
import { Kobold } from '@kobold/db';
import { StringUtils } from '@kobold/base-utils';
import type { KoboldUtils } from './kobold-utils.js';
import { BestiaryEntry, CompendiumEntry, NethysDb } from '@kobold/nethys';

export class NpcUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}
	public static async fetchNethysCompendiumCreatureData(
		nethysCompendium: NethysDb,
		search: string
	): Promise<{ bestiaryCreature: BestiaryEntry; bestiaryCreatureFamily?: CompendiumEntry }> {
		const searchResults = await nethysCompendium.search(search, {
			limit: 50,
			searchTermOnly: false,
			bestiary: true,
		});
		const closestMatchSorter = StringUtils.generateSorterByWordDistance(
			search,
			(c: { [k: string]: any; search: string }) => c.search
		);

		const bestResult = searchResults.sort(closestMatchSorter)[0].data;
		let creatureFamily: CompendiumEntry | undefined;
		if (bestResult) {
			if (bestResult.creature_family) {
				const creatureFamilyResults = await nethysCompendium.search(
					bestResult.creature_family,
					{
						limit: 1,
						searchTermOnly: false,
						bestiary: false,
					}
				);
				creatureFamily = creatureFamilyResults.sort(closestMatchSorter)[0].data;
			}
		}
		return { bestiaryCreature: bestResult, bestiaryCreatureFamily: creatureFamily };
	}
}
