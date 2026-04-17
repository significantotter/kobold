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
		search: string,
		gameSystem = 'pf2e'
	): Promise<{ bestiaryCreature: BestiaryEntry; bestiaryCreatureFamily?: CompendiumEntry }> {
		const searchResults = await nethysCompendium.search(search, {
			limit: 50,
			searchTermOnly: false,
			bestiary: true,
			gameSystem,
		});
		const closestMatchSorter = StringUtils.generateSorterByWordDistance(
			search,
			(c: { [k: string]: any; search: string }) => c.search
		);

		const bestMatch = searchResults.sort(closestMatchSorter)[0];
		if (!bestMatch) {
			throw new Error(`No bestiary results found for "${search}".`);
		}
		const bestResult = bestMatch.data;
		let creatureFamily: CompendiumEntry | undefined;
		if (bestResult.creature_family) {
			const creatureFamilyResults = await nethysCompendium.search(
				bestResult.creature_family,
				{
					limit: 1,
					searchTermOnly: false,
					bestiary: false,
					gameSystem,
				}
			);
			const familyMatch = creatureFamilyResults.sort(closestMatchSorter)[0];
			creatureFamily = familyMatch?.data;
		}
		return { bestiaryCreature: bestResult, bestiaryCreatureFamily: creatureFamily };
	}
}
