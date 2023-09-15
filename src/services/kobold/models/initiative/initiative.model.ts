import type { Initiative as InitiativeType } from './initiative.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import InitiativeSchema from './initiative.schema.json' assert { type: 'json' };
import Objection, { Model, RelationMappings } from 'objection';
import { InitiativeActorGroup } from '../initiative-actor-group/initiative-actor-group.model.js';
import { InitiativeActor } from '../initiative-actor/initiative-actor.model.js';

export interface Initiative extends InitiativeType {
	currentTurnGroup?: InitiativeActorGroup;
	actorGroups?: InitiativeActorGroup[];
	actors?: InitiativeActor[];
}
export class Initiative extends BaseModel {
	static get tableName(): string {
		return 'initiative';
	}

	static get jsonSchema(): Objection.JSONSchema {
		return InitiativeSchema as Objection.JSONSchema;
	}

	static get relationMappings(): RelationMappings {
		return {
			currentTurnGroup: {
				relation: Model.BelongsToOneRelation,
				modelClass: InitiativeActorGroup,
				join: {
					from: 'initiative.currentTurnGroupId',
					to: 'initiativeActorGroup.id',
				},
			},
			actorGroups: {
				relation: Model.HasManyRelation,
				modelClass: InitiativeActorGroup,
				join: {
					from: 'initiative.id',
					to: 'initiativeActorGroup.initiativeId',
				},
			},
			actors: {
				relation: Model.HasManyRelation,
				modelClass: InitiativeActor,
				join: {
					from: 'initiative.id',
					to: 'initiativeActor.initiativeId',
				},
			},
		};
	}
}
