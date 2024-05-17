import { CommandInteraction } from 'discord.js';
import { SQL, and, sql } from 'drizzle-orm';
import _ from 'lodash';
import { getEmoji } from '../../constants/emoji.js';
import { Kobold } from '@kobold/db';
import { Pf2eToolsCompendiumModel } from '@kobold/pf2etools';
import { CompendiumEmbedParser } from '@kobold/pf2etools';
import { Creature } from '@kobold/pf2etools';
import { DrizzleUtils } from '@kobold/pf2etools';
import { KoboldError } from '../KoboldError.js';
import { StringUtils } from '@kobold/base-utils';
import type { KoboldUtils } from './kobold-utils.js';
import { BestiaryEntry, CompendiumEntry, NethysDb } from '@kobold/nethys';

export class NpcUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}
	public static async fetchPf2eToolsCompendiumCreatureData(
		intr: CommandInteraction,
		pf2eToolsCompendium: Pf2eToolsCompendiumModel,
		name: string,
		source?: string
	) {
		// search for the npc's name case insensitively
		let where: SQL<unknown> | undefined = DrizzleUtils.ilike(
			pf2eToolsCompendium.creatures.table.search,
			`%${name}%`
		);
		if (source) {
			where = and(
				where,
				DrizzleUtils.ilike(
					sql`${pf2eToolsCompendium.creatures.table.data}->>'source'`,
					`%${source}%`
				)
			);
		}
		const npcs = await pf2eToolsCompendium.creatures.db.query.Creatures.findMany({
			where: where,
		});

		const embedParser = new CompendiumEmbedParser(pf2eToolsCompendium, (emoji: string) =>
			getEmoji(intr, emoji)
		);

		let npc = StringUtils.findClosestInObjectArray(name, npcs, 'name')?.data;
		if (!npc)
			throw new KoboldError(
				`Yip! I couldn't find the creature ${name}${
					source ? ` from ${source}` : ''
				} in the bestiary!`
			);
		const variantData = await NpcUtils.fetchVariantDataIfExists(pf2eToolsCompendium, npc);
		npc = await embedParser.preprocessData(variantData);

		let npcFluff = (
			await pf2eToolsCompendium.creaturesFluff.db.query.CreaturesFluff.findFirst({
				where: DrizzleUtils.ilike(pf2eToolsCompendium.creaturesFluff.table.name, npc.name),
			})
		)?.data;
		if (npcFluff) npcFluff = await embedParser.preprocessData(npcFluff);

		return { bestiaryCreature: npc, bestiaryCreatureFluff: npcFluff };
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

	/**
	 * Fetches the original creature data if the bestiaryCreature is a variant
	 * bestiaryCreature must not be preprocessed yet, as this will remove the creature reference tag
	 */
	public static async fetchVariantDataIfExists(
		pf2eToolsCompendium: Pf2eToolsCompendiumModel,
		bestiaryCreature: Creature
	): Promise<Creature> {
		if (bestiaryCreature.description && bestiaryCreature.description.includes('{@creature ')) {
			const [originalCreatureName, sourceFileName] = bestiaryCreature.description
				.split('{@creature ')[1]
				.split('}')[0]
				.split('|');

			if (originalCreatureName) {
				let where: SQL<unknown> | undefined = DrizzleUtils.ilike(
					pf2eToolsCompendium.creatures.table.name,
					`%${originalCreatureName}%`
				);
				if (sourceFileName) {
					where = and(
						where,
						DrizzleUtils.ilike(
							sql`${pf2eToolsCompendium.creatures.table}->>'source'`,
							`%${sourceFileName}%`
						)
					);
				}

				const variants = (
					await pf2eToolsCompendium.creatures.db.query.Creatures.findMany({
						where,
					})
				).map(variant => variant.data);

				let originalCreature: Creature | null = null;
				if (variants.length > 1) {
					// find the best name match
					const sorter = StringUtils.generateSorterByWordDistance<Creature>(
						originalCreatureName,
						c => c.name
					);
					originalCreature = variants.sort(sorter)[0];
				} else if (variants.length === 1) {
					originalCreature = variants[0];
				} else return bestiaryCreature;
				const mergedData = _.merge({}, originalCreature, bestiaryCreature);
				return mergedData;
			}
		}
		return bestiaryCreature;
	}
}
