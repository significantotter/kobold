import type { Initiative } from '../../schemas/zod-tables/initiative.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { Model, QueryBuilder } from 'objection';
import type { InitiativeActorGroupModel } from '../initiative-actor-group/initiative-actor-group.model.js';
import type { InitiativeActorModel } from '../initiative-actor/initiative-actor.model.js';
import { zInitiative } from '../../schemas/zod-tables/initiative.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface InitiativeModel extends Initiative {
	currentTurnGroup?: InitiativeActorGroupModel;
	actorGroups?: InitiativeActorGroupModel[];
	actors?: InitiativeActorModel[];
}
export class InitiativeModel extends BaseModel {
	static idColumn = ['id'];
	public $insertIgnore = ['id'];
	static get tableName(): string {
		return 'initiative';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zInitiative;

	public static queryGraphFromChannel(channelId: string) {
		return InitiativeModel.query().withGraphFetched('[actors.[character], actorGroups]').where({
			channelId,
		}) as QueryBuilder<InitiativeGraphModel, InitiativeGraphModel[]>;
	}

	static setupRelationMappings({
		InitiativeActorGroupModel,
		InitiativeActorModel,
	}: {
		InitiativeActorGroupModel: any;
		InitiativeActorModel: any;
	}) {
		this.relationMappings = {
			currentTurnGroup: {
				relation: Model.BelongsToOneRelation,
				modelClass: InitiativeActorGroupModel,
				join: {
					from: 'initiative.currentTurnGroupId',
					to: 'initiativeActorGroup.id',
				},
			},
			actorGroups: {
				relation: Model.HasManyRelation,
				modelClass: InitiativeActorGroupModel,
				join: {
					from: 'initiative.id',
					to: 'initiativeActorGroup.initiativeId',
				},
			},
			actors: {
				relation: Model.HasManyRelation,
				modelClass: InitiativeActorModel,
				join: {
					from: 'initiative.id',
					to: 'initiativeActor.initiativeId',
				},
			},
		};
	}
}

export interface InitiativeGraphModel extends InitiativeModel {
	currentTurnGroup: InitiativeActorGroupModel;
	actorGroups: InitiativeActorGroupModel[];
	actors: InitiativeActorModel[];
}
