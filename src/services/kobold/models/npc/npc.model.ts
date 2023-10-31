import type { Npc } from '../../schemas/npc.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import _ from 'lodash';
import { Creature as CreatureStatBlock } from '../../../pf2etools/schemas/index-types.js';
import { StringUtils } from '../../../../utils/string-utils.js';
import { ZodValidator } from '../../lib/zod-validator.js';
import { zNpc } from '../../schemas/npc.zod.js';

export interface NpcModel extends Npc {}
export class NpcModel extends BaseModel {
	static get tableName(): string {
		return 'npc';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zNpc;

	public async fetchVariantDataIfExists(): Promise<CreatureStatBlock> {
		if (this.data.description && this.data.description.includes('{@creature ')) {
			const [originalCreatureName, sourceFileName] = this.data.description
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
				const mergedData = _.merge({}, originalCreature.data, this.data);
				return mergedData as CreatureStatBlock;
			}
		}
		return this.data as CreatureStatBlock;
	}
}
