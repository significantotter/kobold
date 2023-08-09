import type { InitiativeActor as InitiativeActorType } from './initiative-actor.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import InitiativeActorSchema from './initiative-actor.schema.json' assert { type: 'json' };
import { Model, RelationMappings } from 'objection';
import { Initiative } from '../initiative/initiative.model.js';
import { Sheet as SheetType } from '../../lib/sheet.schema.js';
import { InitiativeActorGroup } from '../initiative-actor-group/initiative-actor-group.model.js';
import { Character } from '../character/character.model.js';
import { ChatInputCommandInteraction, Client } from 'discord.js';

export interface InitiativeActor extends InitiativeActorType {
	initiative?: Initiative;
	actorGroup?: InitiativeActorGroup;
	character?: Character;
	sheet?: SheetType;
}
export class InitiativeActor extends BaseModel {
	public async saveSheet(intr: ChatInputCommandInteraction, sheet: SheetType) {
		// apply any damage effects from the action to the creature
		let promises: any[] = [
			this.$query().patch({ sheet }).execute(),
			Character.query().patch({ sheet }).where('id', this.characterId).execute(),
		];
		if (this.character?.trackerChannelId) {
			promises.push(this.character.updateTracker(intr, sheet));
		}
		if (this.characterId && !this.character) {
			const character = await Character.query().findOne({ id: this.characterId });
			promises.push(character.updateTracker(intr, sheet));
		}

		await Promise.all(promises);
		return;
	}

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

	static queryControlledCharacterByName(characterName) {
		return this.query().whereRaw(`initiativeActor.name ILIKE :characterName`, {
			charName: `%${characterName}%`,
		});
	}
}
