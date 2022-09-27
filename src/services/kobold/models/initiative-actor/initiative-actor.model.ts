import type InitiativeActorTypes from './initiative-actor.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import InitiativeActorSchema from './initiative-actor.schema.json';
import { Model, RelationMappings } from 'objection';
import { Initiative } from '../initiative/initiative.model.js';
import { InitiativeActorGroup } from '../initiative-actor-group/initiative-actor-group.model.js';

export interface InitiativeActor extends InitiativeActorTypes.InitiativeActor {}
export class InitiativeActor extends BaseModel {
	static get tableName(): string {
		return 'initiativeActor';
	}

	static get jsonSchema(): JSONSchema7 {
		return InitiativeActorSchema as JSONSchema7;
	}

	static get relationMappings(): RelationMappings {
		return {
			initiative: {
				relation: Model.BelongsToOneRelation,
				modelClass: Initiative,
				join: {
					from: 'initiativeActor.initiativeId',
					to: 'initiative.id',
				},
			},
			actorGroup: {
				relation: Model.BelongsToOneRelation,
				modelClass: InitiativeActorGroup,
				join: {
					from: 'initiativeActor.initiativeActorGroupId',
					to: 'initiativeActorGroup.id',
				},
			},
		};
	}
}
