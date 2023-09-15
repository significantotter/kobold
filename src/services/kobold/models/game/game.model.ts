import type { Game as GameType } from './game.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import GameSchema from './game.schema.json' assert { type: 'json' };
import Objection, { Model, RelationMappings } from 'objection';
import { Character } from '../character/character.model.js';

export interface Game extends GameType {
	characters: Character[];
}
export class Game extends BaseModel {
	static get tableName(): string {
		return 'game';
	}

	static get jsonSchema(): Objection.JSONSchema {
		return GameSchema as Objection.JSONSchema;
	}

	static async queryWhereUserHasCharacter(userId, guildId) {
		const options = await this.query()
			.withGraphJoined('characters')
			.where({ guildId: guildId });

		return options.filter(
			option =>
				option.characters.filter(char => char.userId === userId && char.isActiveCharacter)
					.length > 0 || option.gmUserId === userId
		);
	}
	static async queryWhereUserLacksCharacter(userId, guildId) {
		const options = await this.query().withGraphFetched('characters').where('guildId', guildId);
		// Filter out the games that the user is already in
		return options.filter(
			option =>
				option.characters.filter(char => char.userId === userId && char.isActiveCharacter)
					.length === 0
		);
	}

	static get relationMappings(): RelationMappings {
		return {
			characters: {
				relation: Model.ManyToManyRelation,
				modelClass: Character,
				join: {
					from: 'game.id',
					through: {
						from: 'charactersInGames.gameId',
						to: 'charactersInGames.characterId',
					},
					to: 'character.id',
				},
			},
		};
	}
}
