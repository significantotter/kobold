import type { Initiative as InitiativeType } from './initiative.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import InitiativeSchema from './initiative.schema.json' assert { type: 'json' };
import Objection, { Model, QueryBuilder, RelationMappings } from 'objection';
import { InitiativeActorGroup } from '../initiative-actor-group/initiative-actor-group.model.js';
import { InitiativeActor } from '../initiative-actor/initiative-actor.model.js';
import { InitWithActorsAndGroups } from '../index.js';
import { removeRequired } from '../../lib/helpers.js';

export interface Initiative extends InitiativeType {
	currentTurnGroupId: number | null;
	currentTurnGroup?: InitiativeActorGroup;
	actorGroups?: InitiativeActorGroup[];
	actors?: InitiativeActor[];
}
export class Initiative extends BaseModel {
	static get tableName(): string {
		return 'initiative';
	}

	public static queryGraphFromChannel(
		channelId: string
	): QueryBuilder<InitWithActorsAndGroups, InitWithActorsAndGroups[]> {
		return Initiative.query().withGraphFetched('[actors.[character], actorGroups]').where({
			channelId,
		}) as QueryBuilder<InitWithActorsAndGroups, InitWithActorsAndGroups[]>;
	}

	static get jsonSchema(): Objection.JSONSchema {
		return removeRequired(InitiativeSchema as unknown as Objection.JSONSchema);
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
