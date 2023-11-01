import type { Npc } from '../../schemas/npc.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import _ from 'lodash';
import { ZodValidator } from '../../lib/zod-validator.js';
import { zNpc } from '../../schemas/npc.zod.js';

export interface NpcModel extends Npc {}
export class NpcModel extends BaseModel {
	public $idColumn = ['id'];
	static get tableName(): string {
		return 'npc';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zNpc;

	static setupRelationMappings({}: {}) {
		this.relationMappings = {};
	}
}
