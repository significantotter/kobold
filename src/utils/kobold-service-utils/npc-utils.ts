import { CommandInteraction } from 'discord.js';
import { SQL, and, sql } from 'drizzle-orm';
import _ from 'lodash';
import { getEmoji } from '../../constants/emoji.js';
import { Kobold } from '../../services/kobold/index.js';
import { CompendiumModel } from '../../services/pf2etools/compendium.model.js';
import { CompendiumEmbedParser } from '../../services/pf2etools/parsers/compendium-parser.js';
import { Creature } from '../../services/pf2etools/schemas/Bestiary.zod.js';
import { DrizzleUtils } from '../../services/pf2etools/utils/drizzle-utils.js';
import { KoboldError } from '../KoboldError.js';
import { StringUtils } from '../string-utils.js';
import type { KoboldUtils } from './kobold-utils.js';

export class NpcUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}
	public static async fetchCompendiumCreatureData(
		intr: CommandInteraction,
		compendium: CompendiumModel,
		name: string,
		source?: string
	) {
		// search for the npc's name case insensitively
		let where: SQL<unknown> | undefined = DrizzleUtils.ilike(
			compendium.creatures.table.search,
			`%${name}%`
		);
		if (source) {
			where = and(
				where,
				DrizzleUtils.ilike(
					sql`${compendium.creatures.table.data}->>'source'`,
					`%${source}%`
				)
			);
		}
		const npcs = await compendium.creatures.db.query.Creatures.findMany({
			where: where,
		});

		const embedParser = new CompendiumEmbedParser(compendium, (emoji: string) =>
			getEmoji(intr, emoji)
		);

		let npc = StringUtils.findClosestInObjectArray(name, npcs, 'name')?.data;
		if (!npc)
			throw new KoboldError(
				`Yip! I couldn't find the creature ${name}${
					source ? ` from ${source}` : ''
				} in the bestiary!`
			);
		const variantData = await NpcUtils.fetchVariantDataIfExists(compendium, npc);
		npc = await embedParser.preprocessData(variantData);

		let npcFluff = (
			await compendium.creaturesFluff.db.query.CreaturesFluff.findFirst({
				where: DrizzleUtils.ilike(compendium.creaturesFluff.table.name, npc.name),
			})
		)?.data;
		if (npcFluff) npcFluff = await embedParser.preprocessData(npcFluff);

		return { bestiaryCreature: npc, bestiaryCreatureFluff: npcFluff };
	}

	/**
	 * Fetches the original creature data if the bestiaryCreature is a variant
	 * bestiaryCreature must not be preprocessed yet, as this will remove the creature reference tag
	 */
	public static async fetchVariantDataIfExists(
		compendium: CompendiumModel,
		bestiaryCreature: Creature
	): Promise<Creature> {
		if (bestiaryCreature.description && bestiaryCreature.description.includes('{@creature ')) {
			const [originalCreatureName, sourceFileName] = bestiaryCreature.description
				.split('{@creature ')[1]
				.split('}')[0]
				.split('|');

			if (originalCreatureName) {
				let where: SQL<unknown> | undefined = DrizzleUtils.ilike(
					compendium.creatures.table.name,
					`%${originalCreatureName}%`
				);
				if (sourceFileName) {
					where = and(
						where,
						DrizzleUtils.ilike(
							sql`${compendium.creatures.table}->>'source'`,
							`%${sourceFileName}%`
						)
					);
				}

				const variants = (
					await compendium.creatures.db.query.Creatures.findMany({
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
