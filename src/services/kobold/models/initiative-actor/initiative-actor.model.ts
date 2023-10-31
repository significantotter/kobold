import type { InitiativeActor } from '../../schemas/initiative-actor.zod.js';
import { BaseModel } from '../../lib/base-model.js';
import { Model, RelationMappings } from 'objection';
import { InitiativeModel } from '../initiative/initiative.model.js';
import { InitiativeActorGroupModel } from '../initiative-actor-group/initiative-actor-group.model.js';
import { CharacterModel } from '../character/character.model.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { StringUtils } from '../../../../utils/index.js';
import _ from 'lodash';
import { zInitiativeActor } from '../../schemas/initiative-actor.zod.js';
import { ZodValidator } from '../../lib/zod-validator.js';
import { Sheet } from '../../lib/schemas/sheet.zod.js';

export interface InitiativeActorModel extends InitiativeActor {
	initiative?: InitiativeModel;
	actorGroup?: InitiativeActorGroupModel;
	character?: CharacterModel;
}
export class InitiativeActorModel extends BaseModel {
	static idColumn: string | string[] = 'id';

	static createValidator() {
		return new ZodValidator();
	}

	public $z = zInitiativeActor;

	public async saveSheet(intr: ChatInputCommandInteraction, sheet: Sheet) {
		// apply any damage effects from the action to the creature
		let promises: any[] = [
			this.$query().patch({ sheet }).execute(),
			CharacterModel.query()
				.patch({ sheet })
				.where('id', this.characterId ?? null)
				.execute(),
		];
		if (this.character?.trackerChannelId) {
			promises.push(this.character.updateTracker(intr, sheet));
		}
		if (this.characterId && !this.character) {
			const character = await CharacterModel.query().findOne({ id: this.characterId });
			if (character) promises.push(character.updateTracker(intr, sheet));
		}

		await Promise.all(promises);
		return;
	}

	static get tableName(): string {
		return 'initiativeActor';
	}

	static get relationMappings(): RelationMappings {
		return {
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

	static async queryControlledCharacterByName(characterName: string) {
		const results = await this.query().whereRaw(`initiativeActor.name ILIKE :characterName`, {
			charName: `%${characterName}%`,
		});
		const closestByName = StringUtils.generateSorterByWordDistance<InitiativeActor>(
			characterName,
			character => character.name
		);
		return results.sort(closestByName);
	}
}
