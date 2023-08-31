import type { InitiativeActorGroup as InitiativeActorGroupType } from './initiative-actor-group.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import InitiativeActorGroupSchema from './initiative-actor-group.schema.json' assert { type: 'json' };
import { Model, RelationMappings } from 'objection';
import { Initiative } from '../initiative/initiative.model.js';
import { InitiativeActor } from '../initiative-actor/initiative-actor.model.js';

export interface InitiativeActorGroup extends InitiativeActorGroupType {
	initiative?: Initiative;
	actors?: InitiativeActor[];
}
export class InitiativeActorGroup extends BaseModel {
	static get tableName(): string {
		return 'initiativeActorGroup';
	}

	static get jsonSchema(): JSONSchema7 {
		return InitiativeActorGroupSchema as JSONSchema7;
	}

	static get relationMappings(): RelationMappings {
		return {
			initiative: {
				relation: Model.BelongsToOneRelation,
				modelClass: Initiative,
				join: {
					from: 'initiativeActorGroup.initiativeId',
					to: 'initiative.id',
				},
			},
			actors: {
				relation: Model.HasManyRelation,
				modelClass: InitiativeActor,
				join: {
					from: 'initiativeActorGroup.id',
					to: 'initiativeActor.initiativeActorGroupId',
				},
			},
		};
	}
}
