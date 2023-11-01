import _ from 'lodash';
import { Npc, NpcModel } from '../services/kobold/index.js';
import { StringUtils } from './string-utils.js';
import { Creature } from '../services/pf2etools/schemas/Bestiary.zod.js';

export class NpcUtils {
	public static async fetchVariantDataIfExists(npc: NpcModel): Promise<Creature> {
		if (npc.data.description && npc.data.description.includes('{@creature ')) {
			const [originalCreatureName, sourceFileName] = npc.data.description
				.split('{@creature ')[1]
				.split('}')[0]
				.split('|');

			if (originalCreatureName) {
				let originalCreatureMatchesQuery = NpcModel.query().whereRaw(
					'LOWER(name) ilike ?',
					[`%${(originalCreatureName ?? '').toLowerCase()}%`]
				);
				if (sourceFileName)
					originalCreatureMatchesQuery = originalCreatureMatchesQuery.andWhereRaw(
						'LOWER(source_file_name) ilike ?',
						[`%${(sourceFileName ?? '').toLowerCase()}%`]
					);
				const originalCreatureMatches = await originalCreatureMatchesQuery;
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
