import type { InitiativeActor as InitiativeActorType } from './initiative-actor.schema.js';
import { BaseModel } from '../../lib/base-model.js';
import InitiativeActorSchema from './initiative-actor.schema.json' assert { type: 'json' };
import Objection, { Model, RelationMappings } from 'objection';
import { Initiative } from '../initiative/initiative.model.js';
import { Sheet as SheetType } from './../character/character.zod.js';
import { InitiativeActorGroup } from '../initiative-actor-group/initiative-actor-group.model.js';
import { Character } from '../character/character.model.js';
import { ChatInputCommandInteraction } from 'discord.js';
import { StringUtils } from '../../../../utils/index.js';
import _ from 'lodash';
import { removeRequired } from '../../lib/helpers.js';

export interface InitiativeActor extends InitiativeActorType {
	initiative?: Initiative;
	actorGroup?: InitiativeActorGroup;
	character?: Character;
	sheet: SheetType;
}
export class InitiativeActor extends BaseModel {
	static idColumn: string | string[] = 'id';

	public async saveSheet(intr: ChatInputCommandInteraction, sheet: SheetType) {
		// apply any damage effects from the action to the creature
		let promises: any[] = [
			this.$query().patch({ sheet }).execute(),
			Character.query()
				.patch({ sheet })
				.where('id', this.characterId ?? null)
				.execute(),
		];
		if (this.character?.trackerChannelId) {
			promises.push(this.character.updateTracker(intr, sheet));
		}
		if (this.characterId && !this.character) {
			const character = await Character.query().findOne({ id: this.characterId });
			if (character) promises.push(character.updateTracker(intr, sheet));
		}

		await Promise.all(promises);
		return;
	}

	static get tableName(): string {
		return 'initiativeActor';
	}

	static get jsonSchema(): Objection.JSONSchema {
		return removeRequired(InitiativeActorSchema as unknown as Objection.JSONSchema);
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
			character: {
				relation: Model.BelongsToOneRelation,
				modelClass: Character,
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
