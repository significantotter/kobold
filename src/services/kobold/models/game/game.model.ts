import type GameTypes from './game.schema.js';
import { JSONSchema7 } from 'json-schema';
import { BaseModel } from '../../lib/base-model.js';
import GameSchema from './game.schema.json';
import { Model, RelationMappings } from 'objection';
import { Character } from '../character/character.model.js';

export interface Game extends GameTypes.Game {
	characters: Character[];
}
export class Game extends BaseModel {
	static get tableName(): string {
		return 'game';
	}

	static get jsonSchema(): JSONSchema7 {
		return GameSchema as JSONSchema7;
	}

	static async queryWhereUserHasCharacter(userId, guildId) {
		const options = await this.query()
			.withGraphJoined('characters')
			.where({ guildId: guildId });

		return options.filter(
			option =>
				option.characters.filter(char => char.userId === userId && char.isActiveCharacter)
					.length > 0
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
