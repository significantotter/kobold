import _ from 'lodash';
import { Npc, NpcModel } from '../../services/kobold/index.js';
import { StringUtils } from '../string-utils.js';
import { Creature } from '../../services/pf2etools/schemas/Bestiary.zod.js';
import { Kobold } from '../../services/kobold/kobold.model.js';
import type { KoboldUtils } from './kobold-utils.js';

export class NpcUtils {
	private kobold: Kobold;
	constructor(private koboldUtils: KoboldUtils) {
		this.kobold = koboldUtils.kobold;
	}
	public static async fetchVariantDataIfExists(npcModel: NpcModel, npc: Npc): Promise<Creature> {
		if (npc.data.description && npc.data.description.includes('{@creature ')) {
			const [originalCreatureName, sourceFileName] = npc.data.description
				.split('{@creature ')[1]
				.split('}')[0]
				.split('|');

			if (originalCreatureName) {
				let originalCreatureMatches;
				npcModel.readMany({ name: originalCreatureName ?? '' });
				if (sourceFileName) {
					originalCreatureMatches = await npcModel.readMany({
						name: originalCreatureName ?? '',
						sourceFileName: sourceFileName,
					});
				} else {
					originalCreatureMatches = await npcModel.readMany({
						name: originalCreatureName ?? '',
					});
				}

				let originalCreature: Npc | null = null;
				if (originalCreatureMatches.length > 1) {
					// find the best name match
					const sorter = StringUtils.generateSorterByWordDistance<Npc>(
						originalCreatureName,
						c => c.name
					);
					originalCreature = originalCreatureMatches.sort(sorter)[0];
				} else {
					originalCreature = originalCreatureMatches[0];
				}
				const mergedData = _.merge({}, originalCreature.data, npc.data);
				return mergedData as Creature;
			}
		}
		return npc.data as Creature;
	}
}
