import type { Initiative } from '../../schemas/initiative.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { Model, QueryBuilder, RelationMappings } from 'objection';
import { InitiativeActorGroupModel } from '../initiative-actor-group/initiative-actor-group.model.js';
import { InitiativeActorModel } from '../initiative-actor/initiative-actor.model.js';
import { InitWithActorsAndGroups } from '../index.js';
import { zInitiative } from '../../schemas/initiative.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface InitiativeModel extends Initiative {
	currentTurnGroup?: InitiativeActorGroupModel;
	actorGroups?: InitiativeActorGroupModel[];
	actors?: InitiativeActorModel[];
}
export class InitiativeModel extends BaseModel {
	static get tableName(): string {
		return 'initiative';
	}

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zInitiative;

	public static queryGraphFromChannel(
		channelId: string
	): QueryBuilder<InitWithActorsAndGroups, InitWithActorsAndGroups[]> {
		return InitiativeModel.query().withGraphFetched('[actors.[character], actorGroups]').where({
			channelId,
		}) as QueryBuilder<InitWithActorsAndGroups, InitWithActorsAndGroups[]>;
	}

	static get relationMappings(): RelationMappings {
		return {
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
