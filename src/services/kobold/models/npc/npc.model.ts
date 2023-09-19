import type { Npc as NpcType } from './npc.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import npc from './npc.schema.json' assert { type: 'json' };
import Sheet from '../../lib/shared-schemas/sheet.schema.json' assert { type: 'json' };
import { Sheet as SheetType } from '../../lib/type-helpers.js';
import _ from 'lodash';
import { CreatureStatBlock } from '../../../pf2etools/pf2etools-types.js';
import { StringUtils } from '../../../../utils/string-utils.js';
import Objection from 'objection';
import { removeRequired } from '../../lib/helpers.js';

export interface Npc extends NpcType {
	sheet?: SheetType;
}
export class Npc extends BaseModel {
	static get tableName(): string {
		return 'npc';
	}

	public async fetchVariantDataIfExists(): Promise<CreatureStatBlock> {
		if (this.data.description && this.data.description.includes('{@creature ')) {
			const [originalCreatureName, sourceFileName] = this.data.description
				.split('{@creature ')[1]
				.split('}')[0]
				.split('|');

			if (originalCreatureName) {
				let originalCreatureMatchesQuery = Npc.query().whereRaw('LOWER(name) ilike ?', [
					`%${(originalCreatureName ?? '').toLowerCase()}%`,
				]);
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

	static get jsonSchema(): Objection.JSONSchema {
		return removeRequired({
			...npc,
			properties: { ...npc.properties, sheet: Sheet },
		} as unknown as Objection.JSONSchema);
	}
}
