import type { InitiativeActor } from '../../schemas/initiative-actor.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { Model } from 'objection';
import type { InitiativeModel } from '../initiative/initiative.model.js';
import type { InitiativeActorGroupModel } from '../initiative-actor-group/initiative-actor-group.model.js';
import type { CharacterModel } from '../character/character.model.js';
import _ from 'lodash';
import { zInitiativeActor } from '../../schemas/initiative-actor.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';

export interface InitiativeActorModel extends InitiativeActor {
	initiative?: InitiativeModel;
	actorGroup?: InitiativeActorGroupModel;
	character?: CharacterModel;
}
export class InitiativeActorModel extends BaseModel {
	public $idColumn = 'id';

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zInitiativeActor;

	static get tableName(): string {
		return 'initiativeActor';
	}

	static setupRelationMappings({
		InitiativeModel,
		InitiativeActorGroupModel,
		CharacterModel,
	}: {
		InitiativeModel: any;
		InitiativeActorGroupModel: any;
		CharacterModel: any;
	}) {
		this.relationMappings = {
			initiative: {
				relation: Model.BelongsToOneRelation,
				modelClass: InitiativeModel,
				join: {
					from: 'initiativeActor.initiativeId',
					to: 'initiative.id',
				},
			},
			actorGroup: {
				relation: Model.BelongsToOneRelation,
				modelClass: InitiativeActorGroupModel,
				join: {
					from: 'initiativeActor.initiativeActorGroupId',
					to: 'initiativeActorGroup.id',
				},
			},
			character: {
				relation: Model.BelongsToOneRelation,
				modelClass: CharacterModel,
				join: {
					from: 'initiativeActor.characterId',
					to: 'character.id',
				},
			},
		};
	}
}
