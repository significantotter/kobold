import type { InitiativeActorGroup } from '../../schemas/initiative-actor-group.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { Model } from 'objection';
import type { InitiativeModel } from '../initiative/initiative.model.js';
import type { InitiativeActorModel } from '../initiative-actor/initiative-actor.model.js';
import { zInitiativeActorGroup } from '../../schemas/initiative-actor-group.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface InitiativeActorGroupModel extends InitiativeActorGroup {
	initiative?: InitiativeModel;
	actors?: InitiativeActorModel[];
}
export class InitiativeActorGroupModel extends BaseModel {
	public $idColumn = 'id';
	static get tableName(): string {
		return 'initiativeActorGroup';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zInitiativeActorGroup;

	static setupRelationMappings({
		InitiativeModel,
		InitiativeActorModel,
	}: {
		InitiativeModel: any;
		InitiativeActorModel: any;
	}) {
		this.relationMappings = {
			initiative: {
				relation: Model.BelongsToOneRelation,
				modelClass: InitiativeModel,
				join: {
					from: 'initiativeActorGroup.initiativeId',
					to: 'initiative.id',
				},
			},
			actors: {
				relation: Model.HasManyRelation,
				modelClass: InitiativeActorModel,
				join: {
					from: 'initiativeActorGroup.id',
					to: 'initiativeActor.initiativeActorGroupId',
				},
			},
		};
	}
}
